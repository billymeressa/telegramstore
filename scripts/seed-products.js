
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { Product } from '../src/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Configuration
const MONGODB_URI = process.env.MONGODB_URI;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!MONGODB_URI || !CLOUDINARY_CLOUD_NAME) {
    console.error('❌ Missing environment variables. Please check .env');
    process.exit(1);
}

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

// 10 MORE Diverse Fashion Products (Batch 2)
const productsToSeed = [
    { title: "Striped Polo Shirt", price: 550, category: "Tops", department: "Men", description: "Classic fit polo with stripes.", imageUrl: "https://images.unsplash.com/photo-1625910513812-72023d85cb96?w=600" },
    { title: "Maxi Skirt", price: 800, category: "Bottoms", department: "Women", description: "Flowy bohemian style maxi skirt.", imageUrl: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600" },
    { title: "Denim Jacket", price: 1300, category: "Outerwear", department: "Unisex", description: "Vintage wash denim jacket.", imageUrl: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600" },
    { title: "Smart Trousers", price: 900, category: "Bottoms", department: "Men", description: "Slim fit formal trousers.", imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600" },
    { title: "Yoga Leggings", price: 750, category: "Activewear", department: "Women", description: "High-stretch yoga pants.", imageUrl: "https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?w=600" },
    { title: "Leather Wallet", price: 400, category: "Accessories", department: "Men", description: "Bi-fold genuine leather wallet.", imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600" },
    { title: "Sun Hat", price: 350, category: "Accessories", department: "Women", description: "Wide brim straw hat for summer.", imageUrl: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600" },
    { title: "Gym Duffle Bag", price: 1100, category: "Accessories", department: "Unisex", description: "Spacious bag for gym gear.", imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600" },
    { title: "Formal Oxford Shoes", price: 2800, category: "Shoes", department: "Men", description: "Black leather oxford shoes.", imageUrl: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600" },
    { title: "Aviator Sunglasses", price: 500, category: "Accessories", department: "Unisex", description: "Classic gold frame aviators.", imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600" }
];

const seed = async () => {
    console.log('🌱 CONNECTING TO MONGODB...');
    // Log masked URI to confirm it's being read
    console.log('URI:', MONGODB_URI.replace(/:([^:@]+)@/, ':****@'));

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected.');

    // console.log('🗑️ Clearing existing products...');
    // await Product.deleteMany({}); // COMMENTED OUT TO APPEND

    console.log(`🚀 Seeding ${productsToSeed.length} products...`);

    let successCount = 0;

    for (const [index, p] of productsToSeed.entries()) {
        try {
            console.log(`\n[${index + 1}/10] Processing: ${p.title}...`);

            // 1. Fetch image buffer from URL using native fetch (Node 18+)
            console.log(`   ⬇️ Downloading image...`);
            const response = await fetch(p.imageUrl);
            if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // 2. Upload to Cloudinary
            console.log(`   ☁️ Uploading to Cloudinary...`);
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'tgminiapp-products' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(buffer);
            });

            // 3. Create Product in DB
            console.log(`   💾 Saving to DB...`);
            await Product.create({
                id: Date.now() + index, // Simple unique ID
                title: p.title,
                price: p.price,
                description: p.description,
                category: p.category,
                department: p.department,
                images: [uploadResult.secure_url]
            });

            successCount++;
            console.log(`   ✅ Done!`);

        } catch (err) {
            console.error(`   ❌ FAILED: ${err.message}`);
        }
    }

    console.log(`\n✨ SEEDING COMPLETE! Successfully added ${successCount} products.`);
    process.exit(0);
};

seed();
