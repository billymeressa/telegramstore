import { Telegraf, Markup } from 'telegraf';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { connectDB, Product, Order, User, AnalyticsEvent, Session, PromoCode } from './src/db.js';
import path from 'path';


// --- BOT & DB SETUP ---
const token = process.env.BOT_TOKEN;
if (!token) throw new Error('BOT_TOKEN must be provided!');
const bot = new Telegraf(token);
let adminUsername = 'Admin';

// Fetch Admin Username on startup
const fetchAdminProfile = async () => {
    try {
        if (process.env.ADMIN_ID) {
            const chat = await bot.telegram.getChat(process.env.ADMIN_ID);
            if (chat.username) adminUsername = `@${chat.username}`;
            else if (chat.first_name) adminUsername = chat.first_name;
        }
    } catch (e) {
        console.error('Failed to fetch admin profile:', e.message);
    }
};
fetchAdminProfile(); // Start fetching immediately

// DEBUG: Log available environment variables (Keys only for security)
console.log('--- ENVIRONMENT VARIABLES DEBUG ---');
console.log('Available Config Keys:', Object.keys(process.env).sort().join(', '));
console.log('MONGODB_URI Type:', typeof process.env.MONGODB_URI);
console.log('-----------------------------------');

(async () => {
    await connectDB();

    // Seed Promo Codes
    try {
        const count = await PromoCode.countDocuments();
        if (count === 0) {
            console.log("Seeding Promo Codes...");
            await PromoCode.insertMany([
                { code: 'WELCOME100', type: 'fixed', value: 100, minSpend: 500, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
                { code: 'LUCKY500', type: 'fixed', value: 500, minSpend: 2000, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }, // 24h expiry
                { code: 'FLASH10', type: 'percent', value: 10, minSpend: 0, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
            ]);
            console.log("Promo Codes seeded.");
        }
    } catch (e) {
        console.error("Seeding error:", e);
    }
})();

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

bot.command('start', async (ctx) => {
    try {
        // Save User to DB
        await User.findOneAndUpdate(
            { userId: ctx.from.id.toString() },
            {
                username: ctx.from.username,
                firstName: ctx.from.first_name,
                userId: ctx.from.id.toString(),
                lastActiveAt: new Date()
            },
            { upsert: true, new: true }
        );

        // Remove old persistent keyboard if present
        await ctx.reply('Loading store...', { reply_markup: { remove_keyboard: true } });

        await ctx.reply(
            `👋 Welcome, ${ctx.from.first_name}!\n\n` +
            `🛍️ *Shop Electronics, Fashion & More*\n` +
            `✨ Exclusive Telegram-only deals\n` +
            `🚚 Fast delivery across Addis Ababa\n` +
            `💳 Secure checkout in just 2 taps\n\n` +
            `🎁 *FIRST-TIME BUYER BONUS: 15% OFF!*\n` +
            `Use code: *WELCOME15* at checkout\n\n` +
            `_Questions? Contact ${adminUsername}_`,
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "🛒 Shop Now & Save!", web_app: { url: process.env.WEB_APP_URL } }],
                        [{ text: "📱 Contact Support", url: `tg://user?id=${process.env.ADMIN_ID}` }]
                    ]
                }
            }
        );
    } catch (e) {
        console.error('Error sending start message:', e);
    }
});

bot.command('about', async (ctx) => {
    await ctx.reply(
        `About Our Store\n\n` +
        `Welcome to your one-stop shop for premium Electronics, Fashion, and more! We are dedicated to providing:\n` +
        `Top-quality products\n` +
        `Best market prices\n` +
        `Fast and reliable delivery\n` +
        `Excellent customer support\n\n` +
        `Location: Addis Ababa, Ethiopia\n` +
        `Contact: [${adminUsername}](tg://user?id=${process.env.ADMIN_ID})\n\n` +
        `Thank you for choosing us!`,
        {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[{ text: "Shop Now", web_app: { url: process.env.WEB_APP_URL } }]]
            }
        }
    );
});

bot.on('web_app_data', (ctx) => {
    const { data } = ctx.webAppData;
    try {
        const order = JSON.parse(data);
        const { items, total_price } = order;

        let message = `Order Received!\n\n`;
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
            process.env.SELLER_ID,
            ...(process.env.ADMIN_IDS || '').split(',')
        ]
            .map(id => (id || '').toString().trim())
            .filter(id => id && !isNaN(parseInt(id)));

        const uniqueAdminIds = [...new Set(adminIds)];

        uniqueAdminIds.forEach(adminId => {
            bot.telegram.sendMessage(adminId, `New Order!\nUser: ${ctx.from.first_name} (@${ctx.from.username})\n\n` + message, { parse_mode: 'Markdown' }).catch(err => console.error(`Failed to notify admin ${adminId}:`, err));
        });
    } catch (e) {
        console.error(e);
        ctx.reply('Received data, but it was invalid JSON.');
    }
});

bot.on('text', async (ctx) => {
    try {
        await ctx.reply(
            `Hi there, ${ctx.from.first_name}!\n\n` +
            `I'm your shopping assistant.\n\n` +
            `Looking for something stylish? Tap the button below to browse our full collection and place an order!\n\n` +
            `_Need help or have any feedback? We'd love to hear from you! Contact the admin directly: [${adminUsername}](tg://user?id=${process.env.ADMIN_ID})_`,
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[{ text: "Open Store", web_app: { url: process.env.WEB_APP_URL } }]]
                }
            }
        );
    } catch (e) {
        console.error('Error handling text message:', e);
    }
});

bot.launch().catch(err => {
    console.error("Telegram Launch Error:", err.message);
    // Continue running API server even if bot fails (e.g. conflict)
});
console.log('Bot is running...');

import verifyTelegramWebAppData from './src/middleware/auth.js';

// --- API SERVER SETUP ---
const app = express();
// CORS Setup - Allow everything for now to fix access issues
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Telegram-Init-Data']
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

// POST /api/game/spin - Play the wheel
app.post('/api/game/spin', async (req, res) => {
    // If we have a user ID from Telegram, we can enforce one-spin-per-user
    // For now, we'll rely on client-side or simple IP check if needed, but let's assume valid user passed.
    // In a real app, verify initData here.
    const { userId } = req.body; // or extract from headers

    if (userId) {
        const user = await User.findOne({ userId });
        if (user && user.lastSpinTime) {
            const lastSpin = new Date(user.lastSpinTime);
            const now = new Date();
            // Check if same day (simple check)
            if (lastSpin.toDateString() === now.toDateString()) {
                return res.json({ success: false, message: 'Come back tomorrow for another spin!', nextSpin: new Date(now.setHours(24, 0, 0, 0)) });
            }
        }
    }

    // Determine Result (Server Authoritative)
    // 0: Try Again, 1: 100 Br, 2: 10% Off, 3: 500 Br (Jackpot)
    const rand = Math.random();
    let prizeIndex;
    let code = null;
    let message = "Better luck next time!";

    if (rand < 0.4) {
        prizeIndex = 0; // 40% Lose
    } else if (rand < 0.7) {
        prizeIndex = 1; // 30% Fixed 100
        code = 'WELCOME100';
        message = "You won 100 Birr off!";
    } else if (rand < 0.9) {
        prizeIndex = 2; // 20% 10% Off
        code = 'FLASH10';
        message = "You won 10% Discount!";
    } else {
        prizeIndex = 3; // 10% Jackpot
        code = 'LUCKY500';
        message = "JACKPOT! 500 Birr off!";
    }

    if (userId) {
        // Record that user spun
        await User.updateOne({ userId }, { lastSpinTime: new Date(), hasSpunWheel: true });
    }

    res.json({ success: true, prizeIndex, code, message });
});

// POST /api/daily-checkin - Daily Streak
app.post('/api/daily-checkin', async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    try {
        const user = await User.findOne({ userId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const now = new Date();
        const lastCheckIn = user.lastCheckInTime ? new Date(user.lastCheckInTime) : null;
        let streak = user.checkInStreak || 0;

        // Check if already checked in today
        if (lastCheckIn && lastCheckIn.toDateString() === now.toDateString()) {
            return res.json({ success: false, message: 'Already checked in today', streak });
        }

        // Check if consecutive
        if (lastCheckIn) {
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1); // Mutates yesterday object

            // Allow check-in if last check-in was yesterday OR today (but we already handled today)
            // If last checkin was BEFORE yesterday, streak breaks.
            if (lastCheckIn.toDateString() === yesterday.toDateString()) {
                streak++;
            } else {
                streak = 1; // Reset if missed a day
            }
        } else {
            streak = 1;
        }

        user.lastCheckInTime = now;
        user.checkInStreak = streak;
        await user.save();

        res.json({ success: true, streak, message: 'Check-in successful!', points: streak * 10 });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/coupons/validate - Check coupon
app.post('/api/coupons/validate', async (req, res) => {
    const { code, cartTotal } = req.body;
    try {
        const promo = await PromoCode.findOne({ code: code.toUpperCase(), isActive: true });

        if (!promo) {
            return res.json({ success: false, message: 'Invalid code' });
        }

        if (promo.expiresAt && promo.expiresAt < new Date()) {
            return res.json({ success: false, message: 'Code expired' });
        }

        if (promo.maxUsage && promo.usedCount >= promo.maxUsage) {
            return res.json({ success: false, message: 'Code usage limit reached' });
        }

        if (cartTotal < promo.minSpend) {
            return res.json({ success: false, message: `Minimum spend of ${promo.minSpend} Br required` });
        }

        // Calculate Discount
        let discount = 0;
        if (promo.type === 'fixed') {
            discount = promo.value;
        } else if (promo.type === 'percent') {
            discount = (cartTotal * promo.value) / 100;
        }

        // Ensure discount doesn't exceed total
        discount = Math.min(discount, cartTotal);

        res.json({ success: true, discount, type: promo.type, value: promo.value });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/check-admin - Check if user is admin
app.get('/api/check-admin', verifyTelegramWebAppData, (req, res) => {
    const userId = req.telegramUser.id;
    const mainAdminId = parseInt(process.env.ADMIN_ID);
    const isSuperAdmin = userId === mainAdminId;

    res.json({ isAdmin: true, isSuperAdmin, user: req.telegramUser });
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

// GET /api/seller-info - Public
app.get('/api/seller-info', async (req, res) => {
    try {
        const sellerId = process.env.SELLER_ID;
        if (!sellerId) {
            return res.status(500).json({ error: 'SELLER_ID not configured' });
        }
        const chat = await bot.telegram.getChat(sellerId);
        res.json({ username: chat.username, first_name: chat.first_name });
    } catch (err) {
        console.error("Error fetching seller info:", err);
        res.status(500).json({ error: 'Failed to fetch seller info' });
    }
});

// POST /api/track - Save analytics event
app.post('/api/track', async (req, res) => {
    try {
        const { userId, eventType, metadata } = req.body;
        if (!userId || !eventType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Fire and forget (don't block response)
        const event = new AnalyticsEvent({ userId, eventType, metadata });
        await event.save(); // Await is fine here as it's fast

        res.json({ success: true });
    } catch (err) {
        console.error("Tracking Error:", err);
        res.status(500).json({ error: 'Failed to track event' });
    }
});

// POST /api/session/start - Start a new session
app.post('/api/session/start', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'Missing userId' });
        }

        // End any active sessions for this user first
        await Session.updateMany(
            { userId, isActive: true },
            {
                endTime: new Date(),
                isActive: false,
                $set: { duration: { $divide: [{ $subtract: [new Date(), "$startTime"] }, 1000] } }
            }
        );

        // Create new session
        const session = new Session({
            userId,
            startTime: new Date(),
            isActive: true
        });
        await session.save();

        res.json({ success: true, sessionId: session._id });
    } catch (err) {
        console.error("Session Start Error:", err);
        res.status(500).json({ error: 'Failed to start session' });
    }
});

// POST /api/session/end - End current session
app.post('/api/session/end', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'Missing userId' });
        }

        const session = await Session.findOne({ userId, isActive: true }).sort({ startTime: -1 });

        if (session) {
            const endTime = new Date();
            const duration = Math.floor((endTime - session.startTime) / 1000); // seconds

            session.endTime = endTime;
            session.duration = duration;
            session.isActive = false;
            await session.save();
        }

        res.json({ success: true });
    } catch (err) {
        console.error("Session End Error:", err);
        res.status(500).json({ error: 'Failed to end session' });
    }
});

// GET /api/analytics/stats - Get aggregated analytics data
app.get('/api/analytics/stats', async (req, res) => {
    try {
        const totalEvents = await AnalyticsEvent.countDocuments({});
        const uniqueUsers = await AnalyticsEvent.distinct('userId');
        const appOpens = await AnalyticsEvent.countDocuments({ eventType: 'app_open' });
        const productViews = await AnalyticsEvent.countDocuments({ eventType: 'view_product' });
        const addToCarts = await AnalyticsEvent.countDocuments({ eventType: 'add_to_cart' });

        // Revenue Metrics (From Orders)
        const revenueStats = await Order.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$total_price' },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;
        const totalOrders = revenueStats.length > 0 ? revenueStats[0].totalOrders : 0;

        // Acquisition Sources
        const userSources = await AnalyticsEvent.aggregate([
            { $match: { eventType: 'app_open', 'metadata.source': { $exists: true, $ne: null } } },
            {
                $group: {
                    _id: '$metadata.source',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $project: { source: '$_id', count: 1, _id: 0 } }
        ]);

        // Top viewed products
        const topProducts = await AnalyticsEvent.aggregate([
            { $match: { eventType: 'view_product' } },
            {
                $group: {
                    _id: '$metadata.productId',
                    count: { $sum: 1 },
                    productTitle: { $first: '$metadata.productTitle' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $project: { productId: '$_id', count: 1, productTitle: 1, _id: 0 } }
        ]);

        // Time-series data for last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyStats = await AnalyticsEvent.aggregate([
            { $match: { timestamp: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                        eventType: "$eventType"
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.date": 1 } }
        ]);

        // Format for frontend consumption
        const chartData = {};
        dailyStats.forEach(item => {
            const date = item._id.date;
            if (!chartData[date]) {
                chartData[date] = { date, app_open: 0, view_product: 0, add_to_cart: 0 };
            }
            chartData[date][item._id.eventType] = item.count;
        });

        const timeSeriesData = Object.values(chartData).sort((a, b) => a.date.localeCompare(b.date));

        // Session metrics
        const totalSessions = await Session.countDocuments({});
        const completedSessions = await Session.find({ isActive: false, duration: { $exists: true } });

        const avgSessionDuration = completedSessions.length > 0
            ? Math.floor(completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / completedSessions.length)
            : 0;

        const sessionsPerUser = totalSessions > 0 && uniqueUsers.length > 0
            ? (totalSessions / uniqueUsers.length).toFixed(1)
            : 0;

        res.json({
            totalEvents,
            uniqueUsers: uniqueUsers.length,
            appOpens,
            productViews,
            addToCarts,
            totalRevenue, // New
            totalOrders, // New
            userSources, // New
            topProducts,
            timeSeriesData,
            sessionMetrics: {
                totalSessions,
                avgSessionDuration, // in seconds
                sessionsPerUser: parseFloat(sessionsPerUser)
            }
        });
    } catch (err) {
        console.error("Analytics Error:", err);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// GET /api/products
app.get('/api/products', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const totalProducts = await Product.countDocuments({});
        const products = await Product.find({})
            .sort({ id: -1 }) // Newest first
            .skip(skip)
            .limit(limit);

        res.json({
            products,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            totalProducts,
            hasMore: page * limit < totalProducts
        });
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
    const { title, price, salePrice, description, category, department, id, variations, soldCount, isFlashSale, flashSaleEndTime, stockPercentage, stock, isUnique, stockStatus } = req.body;

    // Parse variations if it's a string (from FormData)
    let parsedVariations = [];
    if (variations) {
        try {
            parsedVariations = typeof variations === 'string' ? JSON.parse(variations) : variations;
        } catch (e) {
            console.error('Error parsing variations:', e);
            parsedVariations = [];
        }
    }

    // Determine image paths
    let existingImages = req.body.existingImages;
    if (typeof existingImages === 'string') {
        try {
            existingImages = JSON.parse(existingImages);
        } catch (e) {
            existingImages = [existingImages]; // fallback to array with single string
        }
    }
    if (!Array.isArray(existingImages)) existingImages = [];


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
                    price: isNaN(parseFloat(price)) ? 0 : parseFloat(price),
                    salePrice: isNaN(parseFloat(salePrice)) ? 0 : parseFloat(salePrice),
                    soldCount: isNaN(parseInt(soldCount)) ? 0 : parseInt(soldCount),
                    isFlashSale: isFlashSale === 'true' || isFlashSale === true,
                    flashSaleEndTime: flashSaleEndTime ? new Date(flashSaleEndTime) : null,
                    stockPercentage: isNaN(parseInt(stockPercentage)) ? 0 : parseInt(stockPercentage),
                    stock: isNaN(parseInt(stock)) ? 0 : parseInt(stock),
                    isUnique: isUnique === 'true' || isUnique === true,
                    stockStatus: stockStatus || '',
                    description,
                    category,
                    department: department || 'Men',
                    images: finalImages, // This overwrites, assuming frontend logic sends full list
                    variations: parsedVariations
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
                price: isNaN(parseFloat(price)) ? 0 : parseFloat(price),
                salePrice: isNaN(parseFloat(salePrice)) ? 0 : parseFloat(salePrice),
                soldCount: isNaN(parseInt(soldCount)) ? 0 : parseInt(soldCount),
                isFlashSale: isFlashSale === 'true' || isFlashSale === true,
                flashSaleEndTime: flashSaleEndTime ? new Date(flashSaleEndTime) : null,
                stockPercentage: isNaN(parseInt(stockPercentage)) ? 0 : parseInt(stockPercentage),
                stock: isNaN(parseInt(stock)) ? 0 : parseInt(stock),
                isUnique: isUnique === 'true' || isUnique === true,
                stockStatus: stockStatus || '',
                description: description || '',
                category: category || 'General',
                department: department || 'Men',
                images: finalImages,
                variations: parsedVariations
            });
            await newProduct.save();

            // Broadcast to all users
            const users = await User.find({});
            const productMessage = `New Product Alert!\n\n` +
                `*${newProduct.title}*\n` +
                `${newProduct.description ? newProduct.description.substring(0, 100) + (newProduct.description.length > 100 ? '...' : '') + '\n' : ''}` +
                `Price: *${newProduct.price} ETB*\n\n` +
                `Check it out now!`;

            users.forEach(user => {
                bot.telegram.sendMessage(user.userId, productMessage, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [[{ text: "View Product", web_app: { url: `${process.env.WEB_APP_URL}/product/${newProduct.id}` } }]]
                    }
                }).catch(err => {
                    // console.error(`Failed to broadcast to ${user.userId}:`, err.message);
                    // Silently fail if user blocked bot, etc.
                });
            });

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

// GET /api/users - PROTECTED
app.get('/api/users', verifyTelegramWebAppData, async (req, res) => {
    try {
        const users = await User.find({}).sort({ joinedAt: -1 }).limit(50); // Limit to last 50 for now
        res.json(users);
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

        // Deduct Stock
        for (const item of items) {
            try {
                const product = await Product.findOne({ id: item.id });
                if (product) {
                    // Check if item has variations and which one was selected
                    // The item object from frontend usually has `selectedVariations` or we need to match
                    // Wait, the item in orderSchema structure is { title, quantity, price, id }
                    // It doesn't explicitly store the selected variation ID clearly in the schema above, 
                    // but AdminDashboard line 568: `item.selectedVariations` exists in the object even if not in schema def strictly (since it's inside array without robust schema sometimes, or mixed)
                    // Let's check orderSchema in db.js: items is [{ title, quantity, price, id }] - it's loose.
                    // But assuming the frontend sends it, we can match by variation name or ID if available. 
                    // In the current AdminDashboard, it renders `item.selectedVariations`.

                    // If the product has variations, we need to find which one and decrement its stock.
                    // Since `selectedVariations` is an object { "Size": "M", "Color": "Blue" }, we need to find the matching variation in `product.variations`.
                    // `product.variations` has `name` (e.g. "16GB"). 

                    // If multiple variation types (e.g. Size AND Color) are used, `product.variations` array structure in `db.js` seems to be flat: `name`, `price`.
                    // It seems the current variation implementation is simple: just a list of options with prices. 
                    // So `selectedVariations` might just be a single selection or multiple?
                    // In AdminDashboard line 35 of `AdminDashboard.jsx`, `SUBCATEGORIES`... 
                    // line 408 `newProduct.variations` -> `name` and `price`.
                    // The frontend likely sends `selectedVariations` as keys/values.

                    // If product has variations, and order matches one:
                    let varietyMatched = false;
                    if (product.variations && product.variations.length > 0 && item.selectedVariations) {
                        // Attempt to find matching variation.
                        // Simple case: The `name` in `variations` matches one of the values in `selectedVariations`.
                        // E.g. variation name "16GB". selectedVariations: { "Storage": "16GB" }

                        const selectedValues = Object.values(item.selectedVariations);

                        const variationIndex = product.variations.findIndex(v => selectedValues.includes(v.name));

                        if (variationIndex !== -1) {
                            // Decrement variation stock
                            const currentStock = product.variations[variationIndex].stock || 0;
                            product.variations[variationIndex].stock = Math.max(0, currentStock - item.quantity);
                            varietyMatched = true;
                        }
                    }

                    // If no variation matched or product has no variations, decrement main stock
                    if (!varietyMatched) {
                        product.stock = Math.max(0, (product.stock || 0) - item.quantity);
                    }

                    await product.save();
                }
            } catch (stockErr) {
                console.error(`Failed to update stock for product ${item.id}:`, stockErr);
            }
        }

        // Notify Admin via Telegram
        // Notify All Admins via Telegram
        const adminIds = [
            process.env.ADMIN_ID,
            process.env.SELLER_ID,
            ...(process.env.ADMIN_IDS || '').split(',')
        ]
            .map(id => (id || '').toString().trim())
            .filter(id => id && !isNaN(parseInt(id)));

        const uniqueAdminIds = [...new Set(adminIds)];

        uniqueAdminIds.forEach(adminId => {
            let message = `New Order! (ID: ${newOrder.id})\nStatus: Pending\nUser: ${userInfo?.first_name} (@${userInfo?.username})\n\n`;
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
            bot.telegram.sendMessage(order.userId, `Order Update\nYour order #${order.id} status is now: *${status.toUpperCase()}*`, { parse_mode: 'Markdown' }).catch(console.error);
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

// --- RE-ENGAGEMENT SYSTEM ---
const checkInactiveUsers = async () => {
    // console.log('Checking for inactive users...');
    try {
        const now = new Date();
        const INACTIVE_THRESHOLD_DAYS = 7;
        const REENGAGEMENT_COOLDOWN_DAYS = 30; // Don't annoy them too often

        const inactiveDate = new Date(now.getTime() - (INACTIVE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000));

        // Find users active before threshold, but NOT re-engaged recently
        const recentReengagementDate = new Date(now.getTime() - (REENGAGEMENT_COOLDOWN_DAYS * 24 * 60 * 60 * 1000));

        const inactiveUsers = await User.find({
            lastActiveAt: { $lt: inactiveDate },
            $or: [
                { lastReengagementAt: { $exists: false } },
                { lastReengagementAt: { $lt: recentReengagementDate } },
                { lastReengagementAt: null }
            ]
        });

        if (inactiveUsers.length > 0) {
            console.log(`Found ${inactiveUsers.length} inactive users. Sending reminders...`);

            for (const user of inactiveUsers) {
                try {
                    await bot.telegram.sendMessage(
                        user.userId,
                        `We miss you, ${user.firstName || 'there'}!\n\n` +
                        `It's been a while since you visited. We've added lots of new exciting products since then!\n\n` +
                        `Come take a look at what's new.`,
                        {
                            parse_mode: 'Markdown',
                            reply_markup: {
                                inline_keyboard: [[{ text: "Visit Store", web_app: { url: process.env.WEB_APP_URL } }]]
                            }
                        }
                    );

                    // Update re-engagement timestamp
                    await User.updateOne({ userId: user.userId }, { lastReengagementAt: new Date() });
                } catch (err) {
                    console.error(`Failed to send re-engagement to ${user.userId}:`, err.message);
                    // Could also delete user if blocked
                }
            }
        }
    } catch (err) {
        console.error('Error in re-engagement job:', err);
    }
};

// Run check daily (every 24 hours)
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
setInterval(checkInactiveUsers, ONE_DAY_MS);
// Run once on startup after a delay to catch up (e.g., 1 min)
setTimeout(checkInactiveUsers, 60 * 1000);

// Enable graceful stop
process.once('SIGINT', () => { bot.stop('SIGINT'); process.exit(0); });
process.once('SIGTERM', () => { bot.stop('SIGTERM'); process.exit(0); });

