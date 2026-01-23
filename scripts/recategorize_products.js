import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { connectDB, Product } from '../src/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Keyword mapping for categorization
const CATEGORY_RULES = {
    'Electronics': [
        { keywords: ['iphone', 'samsung', 'galaxy', 'redmi', 'pixel', 'phone', 'mobile', 'nokia', 'tecno', 'infinix'], category: 'Phones' },
        { keywords: ['laptop', 'macbook', 'dell', 'hp ', 'lenovo', 'asus', 'acer', 'thinkpad', 'notebook'], category: 'Laptops' },
        { keywords: ['headset', 'headphone', 'earphone', 'airpod', 'buds', 'speaker', 'audio', 'sound'], category: 'Audio' },
        { keywords: ['watch', 'smartwatch', 'band', 'bracelet'], category: 'Wearables' },
        { keywords: ['drive', 'disk', 'usb', 'sd card', 'memory', 'storage', 'ssd', 'hdd'], category: 'Storage' },
        { keywords: ['keyboard', 'mouse', 'webcam', 'monitor', 'screen', 'adapter', 'cable', 'charger', 'hub', 'case', 'cover'], category: 'Computer Accessories' },
        { keywords: ['game', 'ps4', 'ps5', 'xbox', 'controller', 'console', 'nintendo'], category: 'Gaming' },
        { keywords: ['router', 'wifi', 'modem', 'switch'], category: 'Networking' },
        { keywords: ['camera', 'dslr', 'lens', 'tripod'], category: 'Cameras' }
    ],
    // Add other departments if needed, but currently focus is Electronics
};

const categorizeProduct = (product) => {
    // Default to existing category if no better match found
    const text = (product.title + ' ' + product.description).toLowerCase();

    // Check Electronics rules
    const rules = CATEGORY_RULES['Electronics'];
    for (const rule of rules) {
        if (rule.keywords.some(k => text.includes(k))) {
            return rule.category;
        }
    }

    return product.category; // Return original if no match
};

const run = async () => {
    try {
        await connectDB();

        // Read products.json
        const productsPath = path.join(__dirname, '../products.json');
        const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

        console.log(`Analyzing ${productsData.length} products...`);
        let updatedCount = 0;

        const updatedProducts = productsData.map(p => {
            const newCategory = categorizeProduct(p);

            if (newCategory !== p.category) {
                // console.log(`[${p.id}] ${p.title}: ${p.category} -> ${newCategory}`);
                updatedCount++;
                return { ...p, category: newCategory, department: 'Electronics' }; // Ensure department is set
            }
            return p;
        });

        console.log(`\nRe-categorized ${updatedCount} products.`);

        // 1. Update products.json
        fs.writeFileSync(productsPath, JSON.stringify(updatedProducts, null, 2));
        console.log('Updated products.json');

        // 2. Update Database
        await Product.deleteMany({});
        // Prepare for DB insert (ensure correct field mapping matched seed script)
        const dbProducts = updatedProducts.map(p => ({
            id: p.id,
            title: p.title,
            price: p.price,
            description: p.description,
            category: p.category,
            department: p.department,
            images: p.images
        }));

        await Product.insertMany(dbProducts);
        console.log('Updated Database with new categories.');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

run();
