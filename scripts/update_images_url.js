
import mongoose from 'mongoose';
import 'dotenv/config';
import { connectDB, Product } from '../src/db.js';

const NGROK_URL = 'https://ecalcarate-dotty-comprehensibly.ngrok-free.dev';

const updateUrls = async () => {
    try {
        await connectDB();

        const products = await Product.find({});
        console.log(`Found ${products.length} products to update.`);

        let updatedCount = 0;
        for (const p of products) {
            let changed = false;
            const newImages = p.images.map(img => {
                // If it starts with 'uploads/', prepend the ngrok url
                if (img.startsWith('uploads/')) {
                    changed = true;
                    return `${NGROK_URL}/${img}`;
                }
                return img;
            });

            if (changed) {
                p.images = newImages;
                await p.save();
                updatedCount++;
            }
        }

        console.log(`Updated ${updatedCount} products with full ngrok URLs.`);
        process.exit(0);
    } catch (error) {
        console.error('Update failed:', error);
        process.exit(1);
    }
};

updateUrls();
