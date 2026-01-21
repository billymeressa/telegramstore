import { connectDB, Product } from '../src/db.js';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// Connect to MongoDB
connectDB();

const PRODUCTS_FILE = path.join(process.cwd(), 'products.json');

const importData = async () => {
    try {
        const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
        const products = JSON.parse(data);

        // Clear existing products
        await Product.deleteMany();
        console.log('Data Destroyed...');

        // Insert new products
        await Product.insertMany(products);
        console.log('Data Imported!');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

importData();
