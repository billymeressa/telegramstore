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
    images: [{ type: String }] // Array of image URLs (Cloudinary)
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
    joinedAt: { type: Date, default: Date.now }
}));

export { connectDB, Product, Order, User };
