
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const PRODUCTS_PATH = path.join(__dirname, '..', 'products.json');

const productSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    category: { type: String },
    department: { type: String }
}, { strict: false }); // Strict false to avoid validation errors on other fields we don't care about here

const Product = mongoose.model('Product', productSchema);

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI is not defined');
        await mongoose.connect(uri);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('DB Connection Error:', error);
        process.exit(1);
    }
};

const run = async () => {
    await connectDB();

    const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
    console.log(`Loaded ${products.length} products from JSON`);

    let updated = 0;
    for (const p of products) {
        if (p.category) {
            const res = await Product.updateOne(
                { id: p.id },
                {
                    $set: {
                        category: p.category,
                        department: p.department
                    }
                }
            );
            if (res.modifiedCount > 0) updated++;
        }
    }

    console.log(`Updated ${updated} products in Database.`);
    process.exit(0);
};

run();
