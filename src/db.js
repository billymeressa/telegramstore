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
    salePrice: { type: Number, default: 0 },
    description: { type: String },
    category: { type: String, default: 'General' },
    department: { type: String, default: 'Men' },
    soldCount: { type: Number, default: 0 },
    isFlashSale: { type: Boolean, default: false },
    flashSaleEndTime: { type: Date }, // New: Flash sale expiry
    stockPercentage: { type: Number, default: 0 },
    images: [{ type: String }], // Array of image URLs (Cloudinary)
    variations: [{ // Product variations (e.g., different storage sizes)
        name: { type: String, required: true }, // e.g., "16GB", "32GB", "Blue"
        price: { type: Number, required: true }, // Price for this variation
        stock: { type: Number, default: 0 }, // Optional: stock for this variation
        sku: { type: String } // Optional: unique SKU
    }]
}, { timestamps: true });

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
const User = mongoose.model('User', new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String },
    firstName: { type: String },
    joinedAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now },
    lastReengagementAt: { type: Date },
    hasSpunWheel: { type: Boolean, default: false }, // Deprecated but kept for compat
    lastSpinTime: { type: Date }, // New: Track daily spins
    checkInStreak: { type: Number, default: 0 }, // New: Daily check-in streak
    lastCheckInTime: { type: Date } // New: Last daily check-in
}));

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

export { connectDB, Product, Order, User, AnalyticsEvent, Session, PromoCode };
