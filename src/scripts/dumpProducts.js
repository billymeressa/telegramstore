import mongoose from 'mongoose';
import 'dotenv/config'; // Ensure .env is loaded
import { connectDB, Product } from '../db.js';
import fs from 'fs';
import path from 'path';

// Adjust path to .env if needed, assuming running from root
// but dotenv/config usually picks it up if in root.

const dumpProducts = async () => {
    try {
        await connectDB();
        const products = await Product.find({});
        console.log(`Found ${products.length} products.`);

        const dumpPath = path.resolve('products_dump.json');
        fs.writeFileSync(dumpPath, JSON.stringify(products, null, 2));
        console.log(`Products dumped to ${dumpPath}`);

        process.exit(0);
    } catch (error) {
        console.error('Error dumping products:', error);
        process.exit(1);
    }
};

dumpProducts();
