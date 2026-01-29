import mongoose from 'mongoose';
import 'dotenv/config';
import { connectDB, Product } from '../db.js';

const migrate = async () => {
    try {
        await connectDB();
        console.log("Connected to DB for Migration...");

        const products = await Product.find({});
        console.log(`Found ${products.length} products. Checking for price anchoring...`);

        let updatedCount = 0;

        for (const p of products) {
            let needsSave = false;

            // Check Main Price
            if (p.price && (!p.originalPrice || p.originalPrice <= p.price)) {
                // The pre('save') hook we just added will handle the logic!
                // We just need to trigger a save if it looks "wrong" or missing.
                // However, the hook runs on save(), so just calling save() is enough IF we mark it modified? 
                // Actually, Mongoose might not save if no changes detected.
                // But our hook modifies it.

                // Let's manually trigger the logic here to be sure, or rely on the hook.
                // Relying on the hook is cleaner, but let's ensure we dirty the document if needed.
                // Actually, let's just use the hook logic explicitly here to be safe and fast without relying on "triggering" the hook magically.

                const multiplier = 1.5 + Math.random() * 2;
                p.originalPrice = Math.ceil(p.price * multiplier);
                needsSave = true;
            }

            // Check Variations
            if (p.variations && p.variations.length > 0) {
                p.variations.forEach(v => {
                    if (v.price && (!v.originalPrice || v.originalPrice <= v.price)) {
                        const multiplier = 1.5 + Math.random() * 2;
                        v.originalPrice = Math.ceil(v.price * multiplier);
                        needsSave = true;
                    }
                });
            }

            if (needsSave) {
                await p.save(); // This will also re-run the hook, but that's fine.
                updatedCount++;
                process.stdout.write('.');
            }
        }

        console.log(`\nMigration Complete. Updated ${updatedCount} products.`);
        process.exit(0);

    } catch (e) {
        console.error("Migration Error:", e);
        process.exit(1);
    }
};

migrate();
