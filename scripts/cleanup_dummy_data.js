
import mongoose from 'mongoose';
import 'dotenv/config';
import { connectDB, Product } from '../src/db.js';

const cleanup = async () => {
    try {
        await connectDB();

        // Count items with large IDs (timestamp based)
        // Adjust threshold if needed, but imported IDs seem to be < 10000 based on messages.html
        const threshold = 1000000;

        const dummyCount = await Product.countDocuments({ id: { $gt: threshold } });
        console.log(`Found ${dummyCount} dummy products (id > ${threshold}).`);

        if (dummyCount > 0) {
            const res = await Product.deleteMany({ id: { $gt: threshold } });
            console.log(`Deleted ${res.deletedCount} items.`);
        } else {
            console.log('No dummy items found.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
};

cleanup();
