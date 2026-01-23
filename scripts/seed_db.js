import 'dotenv/config'; // To load MONGODB_URI
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, Product } from '../src/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedDB = async () => {
    try {
        await connectDB();

        const productsPath = path.join(__dirname, '../products.json');
        const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

        console.log(`Found ${productsData.length} products to seed.`);

        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products.');

        // Format data to match schema if necessary (schema matches json mostly)
        // Ensure ID is unique and number (cleaned data has numeric IDs)

        await Product.insertMany(productsData);
        console.log('Successfully inserted products.');

        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedDB();
