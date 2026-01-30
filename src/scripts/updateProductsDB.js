import mongoose from 'mongoose';
import 'dotenv/config';
import { connectDB, Product } from '../db.js';
import fs from 'fs';
import path from 'path';

const updateProducts = async () => {
    try {
        await connectDB();

        const cleanDataPath = path.resolve('clean_products.json');
        if (!fs.existsSync(cleanDataPath)) {
            console.error('clean_products.json not found!');
            process.exit(1);
        }

        const products = JSON.parse(fs.readFileSync(cleanDataPath, 'utf-8'));
        console.log(`Loaded ${products.length} products to update.`);

        let updatedCount = 0;

        for (const p of products) {
            // Strip Metadata
            const { _id, __v, createdAt, updatedAt, ...updateData } = p;

            // Only update fields we touched? 
            // Actually, we want to replace title and description mainly.
            // But let's just update title, description.
            // We also fixed some capitalization in descriptions which might affect other things?
            // Let's safe update: title, description, and maybe stockStatus if we changed logic (we didn't).

            await Product.updateOne(
                { id: p.id },
                {
                    $set: {
                        title: updateData.title,
                        description: updateData.description
                    }
                }
            );
            updatedCount++;
            if (updatedCount % 20 === 0) process.stdout.write('.');
        }

        console.log(`\nSuccessfully updated ${updatedCount} products.`);
        process.exit(0);
    } catch (error) {
        console.error('Error updating products:', error);
        process.exit(1);
    }
};

updateProducts();
