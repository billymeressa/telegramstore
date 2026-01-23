import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { connectDB, Product } from '../src/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedProducts = async () => {
    try {
        await connectDB();

        // Read products.json
        const productsPath = path.join(__dirname, '../products.json');
        const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

        console.log(`Read ${productsData.length} products from products.json`);

        // Delete all existing products
        await Product.deleteMany({});
        console.log('Cleared existing products from Database');

        // Insert new products
        // Ensure format matches Schema
        const productsToInsert = productsData.map(p => ({
            id: p.id,
            title: p.title,
            price: p.price,
            description: p.description,
            category: p.category,
            department: p.department,
            images: p.images // This is an array of strings
        }));

        await Product.insertMany(productsToInsert);
        console.log(`Successfully seeded ${productsToInsert.length} products to Database`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedProducts();
