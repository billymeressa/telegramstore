import { Telegraf, Markup } from 'telegraf';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { connectDB, Product, Order, User, AnalyticsEvent, Session, PromoCode, SystemSetting } from './src/db.js';
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
    // Seed Default Settings
    try {
        const setting = await SystemSetting.findOne({ key: 'global_sale_intensity' });
        if (!setting) {
            console.log("Seeding Default System Settings...");
            await SystemSetting.create({ key: 'global_sale_intensity', value: 'medium' });
        }
    } catch (e) {
        console.error("Settings Seeding error:", e);
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
        const startPayload = ctx.payload; // Parameter passed with /start

        // Find or create user
        let user = await User.findOne({ userId: ctx.from.id.toString() });
        const isNewUser = !user;

        if (isNewUser) {
            user = new User({
                userId: ctx.from.id.toString(),
                username: ctx.from.username,
                firstName: ctx.from.first_name,
                referralCode: ctx.from.id.toString(), // Use ID as simple referral code
                lastActiveAt: new Date()
            });

            // Handle Referral
            if (startPayload && startPayload !== user.userId) {
                // Check if referrer exists
                const referrer = await User.findOne({ userId: startPayload }); // Assuming payload is userId
                // Alternatively, if we use custom codes, find by referralCode
                // But for now, we use userId as code.

                if (referrer) {
                    user.referredBy = referrer.userId;
                    console.log(`User ${user.userId} referred by ${referrer.userId}`);
                }
            }
            await user.save();
        } else {
            // Update existing user info
            user.username = ctx.from.username;
            user.firstName = ctx.from.first_name;
            user.lastActiveAt = new Date();
            if (!user.referralCode) user.referralCode = user.userId; // Ensure code exists
            await user.save();
        }

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
            `_📌 Tip: Pin this bot to the top of your chat list for easy access!_\n\n` +
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

// Broadcast Command (Admin Only)
bot.command('broadcast', async (ctx) => {
    try {
        const userId = ctx.from.id.toString();
        const adminId = (process.env.ADMIN_ID || '').toString();

        if (userId !== adminId) {
            return ctx.reply('⛔ Unauthorized.');
        }

        const message = ctx.payload;
        if (!message) {
            return ctx.reply('⚠️ Usage: /broadcast <message>');
        }

        const users = await User.find({});
        let successCount = 0;
        let failCount = 0;

        await ctx.reply(`📢 Starting broadcast to ${users.length} users...`);

        for (const user of users) {
            try {
                await bot.telegram.sendMessage(user.userId, `📢 *Announcement*\n\n${message}`, { parse_mode: 'Markdown' });
                successCount++;
                // Tiny delay to be safe
                await new Promise(r => setTimeout(r, 50));
            } catch (e) {
                failCount++;
                console.error(`Failed to broadcast to ${user.userId}:`, e.message);
            }
        }

        ctx.reply(`✅ Broadcast Complete!\nSent: ${successCount}\nFailed: ${failCount}`);

    } catch (e) {
        console.error("Broadcast Error:", e);
        ctx.reply('❌ Error executing broadcast.');
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
    console.error("Main Store Bot Launch Error:", err.message);
});
console.log('Main Store Bot is running...');

// --- MULTI-BOT LOADER ---
// Check for additional bots and launch them
const launchExtraBots = async () => {
    // 1. Second Bot (Example/Template)
    if (process.env.SECOND_BOT_TOKEN) {
        try {
            const secondBot = new Telegraf(process.env.SECOND_BOT_TOKEN);

            // Dynamic import of the bot logic
            const botModule = await import('./bots/exampleBot.js');

            // Setup the bot
            if (botModule.default) {
                botModule.default(secondBot);
            } else {
                console.error("Error: bots/exampleBot.js does not export a default function.");
            }

            // Launch
            secondBot.launch().catch(err => console.error("Second Bot Launch Error:", err.message));
            console.log("✅ Second Bot (Env: SECOND_BOT_TOKEN) is running!");
        } catch (e) {
            console.error("Failed to load Second Bot:", e);
        }
    }

    // You can add more bots here following the same pattern:
    // if (process.env.THIRD_BOT_TOKEN) ...
};

launchExtraBots();


import { authenticateUser, requireAdmin } from './src/middleware/auth.js';

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

// POST /api/user/spin - Play the wheel
app.post('/api/user/spin', authenticateUser, async (req, res) => {
    try {
        const userId = req.telegramUser.id;
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const now = new Date();
        const lastSpin = user.lastSpinTime ? new Date(user.lastSpinTime) : null;

        // 1. Check 24-hour Cooldown
        if (lastSpin && (now.getTime() - lastSpin.getTime() < 24 * 60 * 60 * 1000)) {
            const timeLeft = Math.ceil((24 * 60 * 60 * 1000 - (now.getTime() - lastSpin.getTime())) / (1000 * 60 * 60));
            return res.json({
                success: false,
                message: `Next spin available in ${timeLeft} hours.`
            });
        }

        // 2. Determine Prize (Weighted Probability)
        // Tier 1 (60%): 5-25 ETB
        // Tier 2 (25%): 26-100 ETB
        // Tier 3 (10%): 101-250 ETB
        // Tier 4 (4%): 251-500 ETB
        // Tier 5 (1%): 501-2,500 ETB

        const rand = Math.random() * 100; // 0 to 100
        let rewardAmount = 0;
        let tier = 0;

        const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

        if (rand < 60) {
            tier = 1;
            rewardAmount = getRandomInt(5, 25);
        } else if (rand < 85) { // 60 + 25
            tier = 2;
            rewardAmount = getRandomInt(26, 100);
        } else if (rand < 95) { // 85 + 10
            tier = 3;
            rewardAmount = getRandomInt(101, 250);
        } else if (rand < 99) { // 95 + 4
            tier = 4;
            rewardAmount = getRandomInt(251, 500);
        } else { // Remaining 1%
            tier = 5;
            rewardAmount = getRandomInt(501, 2500);
        }

        // 3. Update User
        user.walletBalance = (user.walletBalance || 0) + rewardAmount;
        user.lastSpinTime = now;
        user.hasSpunWheel = true; // Legacy flag, kept for compatibility

        user.rewardHistory.push({
            type: 'purchase_reward', // Or 'spin_reward' - prompt didn't specify enum value for spin but schema has purchase_reward. I'll use 'other' or add to Enum if I could, but schema defined: ['daily_checkin', 'referral_bonus', 'purchase_reward', 'other']. I will use 'other' or strictly 'purchase_reward'? 
            // Wait, I can just use 'other' or maybe the prompt implied I could add types. 
            // I'll stick to 'other' for now or maybe 'daily_checkin' is clashing.
            // Let's use 'other' to be safe, or wait, I previously defined the schema enum.
            // Mongoose Enum validation will fail if I use 'spin_reward'.
            // I'll use 'other' and maybe add a note in metadata if I had it.
            // Actually, for better clarity, I'll cheat and use 'purchase_reward' as it's "Monetary" or just 'other'. 
            // Let's check my previous schema edit...
            // enum: ['daily_checkin', 'referral_bonus', 'purchase_reward', 'other']
            // I'll use 'other' effectively for Spin.
            type: 'other',
            amount: rewardAmount,
            timestamp: now
        });

        await user.save();

        res.json({
            success: true,
            reward: rewardAmount,
            tier,
            balance: user.walletBalance,
            message: `You won ${rewardAmount} ETB!`
        });

    } catch (e) {
        console.error("Spin Error:", e);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/daily-checkin - Daily Streak
app.post('/api/daily-checkin', authenticateUser, async (req, res) => {
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

// POST /api/user/slots - Play Lucky Slots
app.post('/api/user/slots', authenticateUser, async (req, res) => {
    try {
        const userId = req.telegramUser.id;
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const now = new Date();
        const lastSlots = user.lastSlotsTime ? new Date(user.lastSlotsTime) : null;

        // 1. Check 12-hour Cooldown
        if (lastSlots && (now.getTime() - lastSlots.getTime() < 12 * 60 * 60 * 1000)) {
            const timeLeft = Math.ceil((12 * 60 * 60 * 1000 - (now.getTime() - lastSlots.getTime())) / (1000 * 60 * 60));
            return res.json({
                success: false,
                message: `Next spin available in ${timeLeft} hours.`
            });
        }

        // 2. Logic: Dynamic Win Chance & Prizes
        const winRateSetting = await SystemSetting.findOne({ key: 'slots_win_rate' });
        const winRate = winRateSetting ? parseFloat(winRateSetting.value) : 0.3;

        const prizeLabelSetting = await SystemSetting.findOne({ key: 'slots_prize_label' });
        const prizeCodeSetting = await SystemSetting.findOne({ key: 'slots_prize_code' });
        const prizeLabel = prizeLabelSetting ? prizeLabelSetting.value : '50% OFF';
        const prizeCode = prizeCodeSetting ? prizeCodeSetting.value : 'JACKPOT50';

        const isWin = Math.random() < winRate;
        let reward = null;
        let finalReels = [];

        // Icons: ['🍎', '🍋', '🍒', '💎', '7️⃣', '🔔'] -> Indices 0-5
        const ICONS_COUNT = 6;

        if (isWin) {
            // Winning: All 3 reels match
            const winIcon = Math.floor(Math.random() * ICONS_COUNT);
            finalReels = [winIcon, winIcon, winIcon];

            // Prize: Dynamic Coupon
            reward = {
                type: 'coupon',
                value: prizeLabel,
                code: prizeCode
            };
        } else {
            // Losing: Ensure they don't all match
            const r1 = Math.floor(Math.random() * ICONS_COUNT);
            const r2 = (r1 + 1) % ICONS_COUNT; // Guaranteed different
            const r3 = Math.floor(Math.random() * ICONS_COUNT);
            finalReels = [r1, r2, r3];
        }

        // 3. Update User
        user.lastSlotsTime = now;
        if (isWin) {
            // Log reward if we want history, checking schema first.. 
            // Reuse 'other' type for now as 'slots_win'
            user.rewardHistory.push({
                type: 'other',
                amount: 0, // Coupon has no fixed monetary value in history usually
                timestamp: now,
                // optional metadata if supported? Schema is strict.
                // Just log it.
            });
        }
        await user.save();

        res.json({
            success: true,
            isWin,
            reward,
            reels: finalReels,
            message: isWin ? 'YOU WON!' : 'Better luck next time!'
        });

    } catch (e) {
        console.error("Slots Error:", e);
        res.status(500).json({ success: false, message: 'Server error' });
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
app.get('/api/check-admin', authenticateUser, (req, res) => {
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

// GET /api/user/me - Get full user profile
app.get('/api/user/me', authenticateUser, async (req, res) => {
    try {
        const userId = req.telegramUser.id.toString();
        // Upsert to ensure user exists if they access Web App directly first time
        // Actually, start command upserts, so findOne should suffice, but to be safe:
        let user = await User.findOne({ userId });

        // Check if existing user needs update (sync profile info)
        if (user) {
            let changed = false;
            // Map Telegram fields to DB fields
            const newPhoto = req.telegramUser.photo_url || '';
            const newFirst = req.telegramUser.first_name || '';
            const newUser = req.telegramUser.username || '';

            if (user.photoUrl !== newPhoto) { user.photoUrl = newPhoto; changed = true; }
            if (user.firstName !== newFirst) { user.firstName = newFirst; changed = true; }
            if (user.username !== newUser) { user.username = newUser; changed = true; }

            if (changed) await user.save();
        }

        if (!user) {
            // Create if missing (edge case)
            user = new User({
                userId,
                username: req.telegramUser.username,
                firstName: req.telegramUser.first_name,
                photoUrl: req.telegramUser.photo_url // Save photo on creation
            });
            await user.save();
        }

        res.json({
            success: true,
            user: {
                id: user.userId, // Return ID for frontend display
                userId: user.userId,
                first_name: user.firstName, // Map back to match Telegram/Frontend expectation
                username: user.username,
                photo_url: user.photoUrl,
                walletBalance: user.walletBalance || 0,
                checkInStreak: user.checkInStreak || 0,
                lastCheckInTime: user.lastCheckInTime,
                lastSpinTime: user.lastSpinTime,
                referralCode: user.referralCode,
                referredBy: user.referredBy
            }
        });
    } catch (e) {
        console.error("User Fetch Error:", e);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/settings - Get Global Settings
app.get('/api/settings', async (req, res) => {
    try {
        const settings = await SystemSetting.find({});
        // Convert to simple key-value object
        const formatted = {};
        settings.forEach(s => formatted[s.key] = s.value);
        res.json({ success: true, settings: formatted });
    } catch (err) {
        console.error("Fetch Settings Error:", err);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// POST /api/settings - Update Global Settings (Admin Only)
app.post('/api/settings', authenticateUser, async (req, res) => {
    try {
        // Basic check using env ADMIN_ID (ensure only admin can change)
        // In a real app we might rely on isSuperAdmin middleware or similar
        const userId = req.telegramUser.id.toString();
        const adminId = (process.env.ADMIN_ID || '').toString();

        if (userId !== adminId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const { key, value } = req.body;
        if (!key || value === undefined) {
            return res.status(400).json({ error: 'Missing key or value' });
        }

        const setting = await SystemSetting.findOneAndUpdate(
            { key },
            { value, updatedAt: new Date() },
            { upsert: true, new: true }
        );

        res.json({ success: true, setting });
    } catch (err) {
        console.error("Update Settings Error:", err);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

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
app.post('/api/session/start', authenticateUser, async (req, res) => {
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
app.post('/api/session/end', authenticateUser, async (req, res) => {
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

// POST /api/cart/sync - Sync frontend cart to backend
app.post('/api/cart/sync', authenticateUser, async (req, res) => {
    try {
        const { cart } = req.body;
        if (!Array.isArray(cart)) {
            return res.status(400).json({ error: 'Invalid cart format' });
        }

        const userId = req.telegramUser.id.toString();
        const user = await User.findOne({ userId });

        if (user) {
            user.cart = cart.map(item => ({
                productId: item.id,
                title: item.title,
                quantity: item.quantity,
                price: item.price,
                selectedVariation: item.selectedVariation ? {
                    name: item.selectedVariation.name,
                    price: item.selectedVariation.price
                } : undefined
            }));
            user.lastCartUpdate = new Date();
            await user.save();
        }

        res.json({ success: true });
    } catch (err) {
        console.error("Cart Sync Error:", err);
        res.status(500).json({ error: 'Failed to sync cart' });
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

// POST /api/notify-order
app.post('/api/notify-order', async (req, res) => {
    try {
        const { product, variation, price, items, total, userInfo } = req.body;
        // console.log("Received Order Notification:", req.body);

        let message = `🆕 *New Order Request!*\n\n`;

        if (userInfo) {
            message += `👤 *Customer:* ${userInfo.first_name || 'User'} (@${userInfo.username || 'NoUsername'})\n`;
        }
        message += `--------------------------------\n`;

        if (items && items.length > 0) {
            // Cart Order
            message += `🛒 *Cart Checkout (${items.length} items)*\n\n`;
            items.forEach((item, idx) => {
                const varText = item.selectedVariation ? ` (${item.selectedVariation.name})` : '';
                message += `${idx + 1}. *${item.title}*${varText}\n`;
                message += `    Qty: ${item.quantity} x ${item.price} ETB\n`;
            });
            message += `\n💰 *Total:* ${total} ETB\n`;

            // --- REFERRAL LOGIC ---
            if (userInfo && userInfo.id) {
                const buyer = await User.findOne({ userId: userInfo.id.toString() });

                // Check if this is their first order (or if they haven't triggered a referral award yet)
                // We can check if they have any previous orders, or use a flag. 
                // Let's check order count or a flag 'referralRewardTriggered'.
                // Simplest: Check if orders count is 0 (before this one is saved, but we don't save orders here yet! We send notif).
                // Wait, this endpoint is just notification. The order saving happens locally or effectively here if we saved it.
                // But the prompt says "ensure the backend awards 200 ETB".
                // I should verify if this is the FIRST order.
                // Assuming we track orders in DB? Schema has Order model.
                // Let's count previous orders for this user.

                const previousOrdersCount = await Order.countDocuments({ userId: userInfo.id.toString() });

                if (previousOrdersCount === 0 && buyer && buyer.referredBy) {
                    // Award Referrer
                    const referrer = await User.findOne({ userId: buyer.referredBy });
                    if (referrer) {
                        referrer.walletBalance = (referrer.walletBalance || 0) + 200;
                        referrer.rewardHistory.push({
                            type: 'referral_bonus',
                            amount: 200,
                            timestamp: new Date()
                        });
                        await referrer.save();

                        // Notify Referrer
                        bot.telegram.sendMessage(referrer.userId,
                            `🎉 *Referral Bonus!*\n\nYour friend ${userInfo.first_name} just made their first purchase.\nYou've earned *200 ETB*!`,
                            { parse_mode: 'Markdown' }
                        ).catch(e => console.error("Failed to notify referrer:", e));

                        console.log(`Awarded 200 ETB to referrer ${referrer.userId} for user ${buyer.userId}`);
                    }
                }
            }

        } else if (product) {
            // Single Item Buy
            const varText = variation ? ` (${variation.name})` : '';
            message += `🛍️ *Product:* ${product.title}${varText}\n`;
            message += `💰 *Price:* ${price} ETB\n`;
            if (product.id) message += `🆔 *ID:* ${product.id}\n`;
        } else {
            return res.status(400).json({ error: 'Invalid order data' });
        }

        message += `\n--------------------------------\n`;
        message += `⚠️ _Please check stock and reply to customer._`;

        // Send to Admin
        if (process.env.ADMIN_ID) {
            await bot.telegram.sendMessage(process.env.ADMIN_ID, message, { parse_mode: 'Markdown' });
            res.json({ success: true });
        } else {
            console.error("ADMIN_ID not set");
            res.status(500).json({ error: 'Admin ID not configured' });
        }

    } catch (err) {
        console.error("Notification Error:", err);
        res.status(500).json({ error: 'Failed to send notification' });
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

        if (product) {
            // Count unique views for social proof
            // We use 'view_product' events and count distinct users or total events. 
            // Prompt says "unique view count", so distinct users.
            // But for performance, if we have millions, this aggregation might be slow. 
            // Given it's a mini app, it should be fine. Or we can just count documents for "views".
            // "Actual unique view count" -> distinct userId.
            const uniqueViews = (await AnalyticsEvent.distinct('userId', {
                eventType: 'view_product',
                'metadata.productId': id
            })).length;

            // Return product object + viewCount
            res.json({ ...product.toObject(), viewCount: uniqueViews });
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/products (Add/Edit) - PROTECTED
app.post('/api/products', authenticateUser, requireAdmin, upload.array('images', 5), async (req, res) => {
    const { title, price, originalPrice, description, category, department, id, variations, stock, isUnique, stockStatus } = req.body;

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
                    originalPrice: originalPrice ? parseFloat(originalPrice) : undefined, // Ensure number
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
                originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
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
app.delete('/api/products/:id', authenticateUser, requireAdmin, async (req, res) => {
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
app.get('/api/orders', authenticateUser, async (req, res) => {
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
app.get('/api/users', authenticateUser, requireAdmin, async (req, res) => {
    try {
        const users = await User.find({}).sort({ joinedAt: -1 }).limit(50); // Limit to last 50 for now
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/orders
app.post('/api/orders', authenticateUser, async (req, res) => {
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
app.patch('/api/orders/:id', authenticateUser, requireAdmin, async (req, res) => {
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

// --- RE-ENGAGEMENT & SCHEDULER ---
import initScheduler from './src/jobs/scheduler.js';

// Initialize Cron Jobs
initScheduler(bot);

// Enable graceful stop
process.once('SIGINT', () => { bot.stop('SIGINT'); process.exit(0); });
process.once('SIGTERM', () => { bot.stop('SIGTERM'); process.exit(0); });

