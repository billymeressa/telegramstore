import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Product } from '../src/db.js'; // Adjust path as needed

// Load env vars
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../.env') });

const migrate = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI missing');

        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri);
        console.log('Connected.');

        console.log('Updating all products to Distinct (isUnique: true, stock: 1)...');

        // Update all documents
        const result = await Product.updateMany(
            {},
            {
                $set: {
                    isUnique: true,
                    stock: 1,
                    stockStatus: 'Distinct'
                }
            }
        );

        console.log(`Migration complete. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
        process.exit(0);
    }
};

migrate();
