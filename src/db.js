import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
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

export { connectDB, Product, Order };
