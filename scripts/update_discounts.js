import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product, connectDB } from '../src/db.js';

dotenv.config();

const updateDiscounts = async () => {
    try {
        await connectDB();
        console.log('Connected to DB. Fetching products...');

        const products = await Product.find({});
        console.log(`Found ${products.length} products.`);

        let updatedCount = 0;

        for (const product of products) {
            let changed = false;

            // Recalculate Main Price
            if (product.price) {
                // New range: 1.15 - 1.55
                const multiplier = 1.15 + Math.random() * 0.40;
                const newOriginal = Math.ceil(product.price * multiplier);

                // Only update if the discount is currently too high (e.g., > 50%) or force update all?
                // User said "make sure all products... use lower rates". So we re-roll everyone.
                product.originalPrice = newOriginal;
                changed = true;
            }

            // Recalculate Variations
            if (product.variations && product.variations.length > 0) {
                product.variations.forEach(v => {
                    if (v.price) {
                        const multiplier = 1.15 + Math.random() * 0.40;
                        v.originalPrice = Math.ceil(v.price * multiplier);
                        changed = true;
                    }
                });
            }

            if (changed) {
                await product.save();
                updatedCount++;
                process.stdout.write(`\rUpdated ${updatedCount}/${products.length}`);
            }
        }

        console.log(`\n\nSuccess! Updated ${updatedCount} products.`);
        process.exit(0);

    } catch (error) {
        console.error('Migration Error:', error);
        process.exit(1);
    }
};

updateDiscounts();
