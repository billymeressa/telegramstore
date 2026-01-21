
import mongoose from 'mongoose';
import 'dotenv/config';
import { connectDB, Product } from '../src/db.js';

const verify = async () => {
    try {
        await connectDB();

        const threshold = 1000000;
        const dummyCount = await Product.countDocuments({ id: { $gt: threshold } });
        const realCount = await Product.countDocuments({ id: { $lte: threshold } });

        console.log(`Verification:`);
        console.log(`- Dummy products (> ${threshold}): ${dummyCount}`);
        console.log(`- Real products (<= ${threshold}): ${realCount}`);

        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
};

verify();
