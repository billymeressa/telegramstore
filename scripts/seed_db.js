
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config'; // Load .env
import { connectDB, Product } from '../src/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTS_FILE = path.join(__dirname, '../scraped_data/products.json');

const seedData = async () => {
    try {
        await connectDB();

        if (!fs.existsSync(PRODUCTS_FILE)) {
            console.error('Products file not found!');
            process.exit(1);
        }

        const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
        const products = JSON.parse(data);

        console.log(`Found ${products.length} products to seed.`);

        let added = 0;
        let updated = 0;

        for (const item of products) {
            // Transform to Schema format
            const productData = {
                id: parseInt(item.id),
                title: item.name, // JSON has name, Schema has title
                price: item.price,
                description: item.description,
                category: item.category,
                department: 'Men', // Default
                images: [item.imageUrl] // Schema expects array
                // imageUrl in json is "uploads/..." which is relative url. 
                // Frontend should handle it. Or we prepend full URL?
                // For now, relative is better if we serve from same domain.
            };

            // Check if exists
            const exists = await Product.findOne({ id: productData.id });
            if (exists) {
                // Update
                await Product.findOneAndUpdate({ id: productData.id }, productData);
                updated++;
            } else {
                // Insert
                await Product.create(productData);
                added++;
            }
        }

        console.log(`Seeding complete. Added: ${added}, Updated: ${updated}`);
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
