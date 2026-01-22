import { Telegraf, Markup } from 'telegraf';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { connectDB, Product, Order } from './src/db.js';
import path from 'path';


// --- BOT & DB SETUP ---
const token = process.env.BOT_TOKEN;
if (!token) throw new Error('BOT_TOKEN must be provided!');
const bot = new Telegraf(token);

// DEBUG: Log available environment variables (Keys only for security)
console.log('--- ENVIRONMENT VARIABLES DEBUG ---');
console.log('Available Config Keys:', Object.keys(process.env).sort().join(', '));
console.log('MONGODB_URI Type:', typeof process.env.MONGODB_URI);
console.log('-----------------------------------');

connectDB(); // Connect to MongoDB

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

bot.command('start', async (ctx) => {
    try {
        // Remove old persistent keyboard if present
        await ctx.reply('Loading store...', { reply_markup: { remove_keyboard: true } });

        await ctx.reply('Welcome to the Store! Click below to shop.', {
            reply_markup: {
                inline_keyboard: [[{ text: "🛍️ Open Store", web_app: { url: process.env.WEB_APP_URL } }]]
            }
        });
    } catch (e) {
        console.error('Error sending start message:', e);
    }
});

bot.on('web_app_data', (ctx) => {
    const { data } = ctx.webAppData;
    try {
        const order = JSON.parse(data);
        const { items, total_price } = order;

        let message = `✅ *Order Received!*\n\n`;
        message += `Total: ${total_price.toFixed(2)} ETB\n\n`;
        message += `*Items:*\n`;

        items.forEach(item => {
            message += `- ${item.title} (x${item.quantity}) - ${(item.price * item.quantity).toFixed(2)} ETB\n`;
        });

        ctx.replyWithMarkdown(message);

        // Notify Admin
        // Notify All Admins
        const adminIds = [
            process.env.ADMIN_ID,
            ...(process.env.ADMIN_IDS || '').split(',')
        ]
            .map(id => (id || '').toString().trim())
            .filter(id => id && !isNaN(parseInt(id)));

        const uniqueAdminIds = [...new Set(adminIds)];

        uniqueAdminIds.forEach(adminId => {
            bot.telegram.sendMessage(adminId, `🔔 *New Order!*\nUser: ${ctx.from.first_name} (@${ctx.from.username})\n\n` + message, { parse_mode: 'Markdown' }).catch(err => console.error(`Failed to notify admin ${adminId}:`, err));
        });
    } catch (e) {
        console.error(e);
        ctx.reply('Received data, but it was invalid JSON.');
    }
});

bot.on('text', async (ctx) => {
    try {
        await ctx.reply(
            `👋 *Hi there, ${ctx.from.first_name}!*\n\n` +
            `I'm your shopping assistant. 🛍️\n\n` +
            `Look looking for something stylish? Tap the button below to browse our full collection and place an order!\n\n` +
            `_Need help? Contact support directly._`,
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[{ text: "🛍️ Open Store", web_app: { url: process.env.WEB_APP_URL } }]]
                }
            }
        );
    } catch (e) {
        console.error('Error handling text message:', e);
    }
});

bot.launch();
console.log('Bot is running...');

import verifyTelegramWebAppData from './src/middleware/auth.js';

// --- API SERVER SETUP ---
const app = express();
// CORS Setup - Allow everything for now to fix access issues
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// app.options('*', cors()); // REMOVED: Incompatible with Express 5 syntax
app.use(express.json());
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Health Check / Root Route
app.get('/', (req, res) => {
    res.send('Backend is actively running! Status: OK');
});

// Multer Memory Storage (for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// GET /api/check-admin - Check if user is admin
app.get('/api/check-admin', verifyTelegramWebAppData, (req, res) => {
    res.json({ isAdmin: true, user: req.telegramUser });
});

// Helper to upload buffer to Cloudinary
const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "tg_miniapp_products" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

// GET /api/products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/products/:id
app.get('/api/products/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const product = await Product.findOne({ id: id });
        if (product) res.json(product);
        else res.status(404).json({ error: 'Product not found' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/products (Add/Edit) - PROTECTED
app.post('/api/products', verifyTelegramWebAppData, upload.array('images', 5), async (req, res) => {
    const { title, price, description, category, department, id } = req.body;

    // Determine image paths
    let existingImages = req.body.existingImages;
    if (typeof existingImages === 'string') existingImages = [existingImages];
    if (!existingImages) existingImages = [];

    let newImagePaths = [];
    if (req.files && req.files.length > 0) {
        try {
            const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
            const results = await Promise.all(uploadPromises);
            newImagePaths = results.map(r => r.secure_url);
        } catch (uploadErr) {
            console.error("Cloudinary Upload Error:", uploadErr);
            return res.status(500).json({ error: `Image Upload Failed: ${uploadErr.message}` });
        }
    }

    const finalImages = [...existingImages, ...newImagePaths];

    try {
        if (id) {
            // Edit existing
            const updatedProduct = await Product.findOneAndUpdate(
                { id: parseInt(id) },
                {
                    title,
                    price: parseFloat(price),
                    description,
                    category,
                    department: department || 'Men',
                    images: finalImages // This overwrites, assuming frontend logic sends full list
                },
                { new: true }
            );

            // To return full list efficiently, or just the updated one? frontend expects full list usually?
            // Actually original code returned full list. Let's stick to that for compatibility, 
            // but for performance usually we return the item.
            // Let's return the full list to stay compatible with the simple frontend state management.
            const allProducts = await Product.find({});
            res.json({ success: true, products: allProducts });

        } else {
            // Add new
            const newProduct = new Product({
                id: Date.now(),
                title,
                price: parseFloat(price),
                description: description || '',
                category: category || 'General',
                department: department || 'Men',
                images: finalImages
            });
            await newProduct.save();
            const allProducts = await Product.find({});
            res.json({ success: true, products: allProducts });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/products/:id - PROTECTED
app.delete('/api/products/:id', verifyTelegramWebAppData, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await Product.findOneAndDelete({ id: id });
        const products = await Product.find({});
        res.json({ success: true, products });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ORDERS API ---

// GET /api/orders
app.get('/api/orders', async (req, res) => {
    const { userId } = req.query;
    try {
        let query = {};
        if (userId) {
            query.userId = userId.toString();
        }
        const orders = await Order.find(query);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/orders
app.post('/api/orders', async (req, res) => {
    const { items, total_price, userId, userInfo } = req.body;

    try {
        const newOrder = await Order.create({
            id: Date.now(),
            userId,
            userInfo,
            items,
            total_price,
            status: 'pending'
        });

        // Notify Admin via Telegram
        // Notify All Admins via Telegram
        const adminIds = [
            process.env.ADMIN_ID,
            ...(process.env.ADMIN_IDS || '').split(',')
        ]
            .map(id => (id || '').toString().trim())
            .filter(id => id && !isNaN(parseInt(id)));

        const uniqueAdminIds = [...new Set(adminIds)];

        uniqueAdminIds.forEach(adminId => {
            let message = `🔔 *New Order!* (ID: ${newOrder.id})\nStatus: Pending\nUser: ${userInfo?.first_name} (@${userInfo?.username})\n\n`;
            items.forEach(item => {
                message += `- ${item.title} (x${item.quantity})\n`;
            });
            message += `\nTotal: ${total_price.toFixed(2)} ETB`;

            bot.telegram.sendMessage(adminId, message, { parse_mode: 'Markdown' }).catch(err => console.error(`Failed to notify admin ${adminId}:`, err));
        });

        res.json({ success: true, order: newOrder });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/orders/:id (Update Status) - PROTECTED
app.patch('/api/orders/:id', verifyTelegramWebAppData, async (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    try {
        const order = await Order.findOneAndUpdate(
            { id: id },
            { status: status },
            { new: true }
        );

        if (!order) {
            return res.json({ success: false, error: 'Order not found' });
        }

        const orders = await Order.find({}); // Return all needed?

        // Notify User if they have a userId
        if (order.userId) {
            bot.telegram.sendMessage(order.userId, `📦 *Order Update*\nYour order #${order.id} status is now: *${status.toUpperCase()}*`, { parse_mode: 'Markdown' }).catch(console.error);
        }

        res.json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000; // Use env PORT for Render
app.listen(PORT, () => {
    console.log(`API Server running on http://localhost:${PORT}`);
});

// Enable graceful stop
process.once('SIGINT', () => { bot.stop('SIGINT'); process.exit(0); });
process.once('SIGTERM', () => { bot.stop('SIGTERM'); process.exit(0); });

