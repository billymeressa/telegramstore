import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI is not defined in environment variables');

        // Log masked URI for debugging (hide password)
        console.log(`Attempting to connect to MongoDB: ${uri.replace(/:([^:@]+)@/, ':****@')}`);

        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000, // Fail after 5s if not found
            socketTimeoutMS: 45000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('----------------------------------------');
        console.error('MONGODB CONNECTION ERROR:');
        console.error(error.message);
        console.error('----------------------------------------');
        process.exit(1);
    }
};

const productSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, // Keeping numeric ID for compatibility with existing frontend logic if needed, or we can migrate to _id
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    category: { type: String, default: 'General' },
    department: { type: String, default: 'Men' },
    stock: { type: Number, default: 1 }, // Default to 1 (Distinct)
    isUnique: { type: Boolean, default: true }, // Default to True
    stockStatus: { type: String, default: 'Distinct' }, // Custom label for unique items (e.g. "Vintage")
    images: [{ type: String }], // Array of image URLs (Cloudinary)
    originalPrice: { type: Number }, // Price Anchoring: The "before" price
    variations: [{ // Product variations (e.g., different storage sizes)
        name: { type: String, required: true }, // e.g., "16GB", "32GB", "Blue"
        price: { type: Number, required: true }, // Price for this variation
        originalPrice: { type: Number }, // Variation specific original price
        stock: { type: Number, default: 0 }, // Stock for this variation
        sku: { type: String } // Optional: unique SKU
    }],
    // Scarcity Rotation Fields
    isFlashSale: { type: Boolean, default: false },
    flashSaleEndTime: { type: Date },
    forceLowStockDisplay: { type: Boolean, default: false } // To artificially show "Low Stock" badge
}, { timestamps: true });

// Dynamic Price Anchoring Logic
productSchema.pre('save', async function () {
    // 1. Handle Main Product Price
    if (this.price && (!this.originalPrice || this.originalPrice <= this.price)) {
        // Generate random multiplier between 1.5 and 3.5
        const multiplier = 1.5 + Math.random() * 2;
        this.originalPrice = Math.ceil(this.price * multiplier);
    }

    // 2. Handle Variations
    if (this.variations && this.variations.length > 0) {
        this.variations.forEach(v => {
            if (v.price && (!v.originalPrice || v.originalPrice <= v.price)) {
                const multiplier = 1.5 + Math.random() * 2;
                v.originalPrice = Math.ceil(v.price * multiplier);
            }
        });
    }
});

const orderSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, // Keeping numeric ID
    userId: { type: String }, // Telegram User ID
    userInfo: {
        first_name: String,
        username: String,
    },
    items: [{
        title: String,
        quantity: Number,
        price: Number,
        id: Number
    }],
    total_price: { type: Number, required: true },
    status: { type: String, default: 'pending', enum: ['pending', 'shipped', 'delivered', 'cancelled'] },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String },
    firstName: { type: String },
    joinedAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now },
    lastReengagementAt: { type: Date },
    hasSpunWheel: { type: Boolean, default: false }, // Deprecated but kept for compat
    lastSpinTime: { type: Date }, // New: Track daily spins
    checkInStreak: { type: Number, default: 0 }, // New: Daily check-in streak
    lastCheckInTime: { type: Date }, // New: Last daily check-in
    walletBalance: { type: Number, default: 0 },
    referralCode: { type: String, unique: true, default: () => Math.random().toString(36).substring(2, 8).toUpperCase() },
    referredBy: { type: String }, // Referral code of the referrer
    rewardHistory: [{
        type: { type: String, enum: ['daily_checkin', 'referral_bonus', 'purchase_reward', 'other'] },
        amount: { type: Number, required: true },
        timestamp: { type: Date, default: Date.now }
    }]
});

userSchema.methods.checkDailyCheckIn = async function () {
    const now = new Date();
    const lastCheckIn = this.lastCheckInTime ? new Date(this.lastCheckInTime) : null;

    // Provide a small buffer or ensure STRICT 24 hours. The prompt says "validates if 24 hours have passed".
    // However, usually "Daily Check-in" means "once per calendar day" or "after 24h".
    // Given the prompt "validates if 24 hours have passed", I will use strict 24h check.

    if (lastCheckIn && (now.getTime() - lastCheckIn.getTime() < 24 * 60 * 60 * 1000)) {
        return { success: false, message: '24 hours have not passed yet.' };
    }

    // Logic for streak reset: if > 48 hours passed, streak resets. (Allowing 24-48h window to maintain streak)
    if (lastCheckIn && (now.getTime() - lastCheckIn.getTime() > 48 * 60 * 60 * 1000)) {
        this.checkInStreak = 0;
    }

    this.checkInStreak += 1;
    this.lastCheckInTime = now;

    // Reward Tiers (Day 1-7+)
    // Cycle: Day 1 (1) -> Day 7 (7) -> Day 8 (1) -> ...
    const dayInCycle = ((this.checkInStreak - 1) % 7) + 1;
    let rewardAmount = 0;

    switch (dayInCycle) {
        case 1: rewardAmount = 25; break;
        case 2: rewardAmount = 40; break;
        case 3: rewardAmount = 50; break;
        case 4: rewardAmount = 75; break;
        case 5: rewardAmount = 100; break;
        case 6: rewardAmount = 150; break;
        case 7: rewardAmount = 250; break;
        default: rewardAmount = 25; // Fallback
    }

    this.walletBalance += rewardAmount;
    this.rewardHistory.push({
        type: 'daily_checkin',
        amount: rewardAmount,
        timestamp: now
    });

    await this.save();
    return { success: true, reward: rewardAmount, streak: this.checkInStreak };
};

const User = mongoose.model('User', userSchema);

const PromoCode = mongoose.model('PromoCode', new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    type: { type: String, enum: ['fixed', 'percent'], required: true }, // 'fixed' amount or 'percent' off
    value: { type: Number, required: true },
    minSpend: { type: Number, default: 0 },
    maxUsage: { type: Number, default: null }, // null = unlimited
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true }
}));

const AnalyticsEvent = mongoose.model('AnalyticsEvent', new mongoose.Schema({
    userId: { type: String, index: true },
    eventType: { type: String, required: true }, // e.g., 'app_open', 'view_product'
    metadata: { type: mongoose.Schema.Types.Mixed }, // Additional data (productId, etc.)
    timestamp: { type: Date, default: Date.now }
}));

const Session = mongoose.model('Session', new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    duration: { type: Number }, // in seconds
    eventsCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}));

const SystemSetting = mongoose.model('SystemSetting', new mongoose.Schema({
    key: { type: String, required: true, unique: true }, // e.g., 'global_sale_intensity'
    value: { type: mongoose.Schema.Types.Mixed, required: true }, // e.g., 'low', 'medium', 'high'
    updatedAt: { type: Date, default: Date.now }
}));

export { connectDB, Product, Order, User, AnalyticsEvent, Session, PromoCode, SystemSetting };
