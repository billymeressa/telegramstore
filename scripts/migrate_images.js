import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const SCRAPED_PRODUCTS_PATH = path.join(process.cwd(), 'scraped_data/products.json');
const PHOTOS_DIR = path.join(process.cwd(), 'scraped_data/photos');
const DEST_PRODUCTS_PATH = path.join(process.cwd(), 'products.json');

async function migrateImages() {
    try {
        console.log('Reading scraped products...');
        const rawData = fs.readFileSync(SCRAPED_PRODUCTS_PATH, 'utf-8');
        const scrapedProducts = JSON.parse(rawData);

        console.log(`Found ${scrapedProducts.length} products to process.`);

        const newProducts = [];
        let processedCount = 0;

        for (const product of scrapedProducts) {
            // Transform ID to number or keep unique
            // The existing bot uses number IDs usually, but let's keep it simple.
            // We'll generate a new ID based on current timestamp + index to avoid collisions if we were appending
            // But since we are overwriting, we can just use 1-based index or preserve the scraped ID if it's numeric.

            const newProduct = {
                id: parseInt(product.id) || Date.now() + processedCount,
                title: product.name,
                price: parseFloat(product.price) || 0,
                description: product.description,
                category: product.category || 'General',
                department: 'Electronics', // Default department
                variations: [],
                images: []
            };

            // Fix Image Path Logic
            // Scraped path: "uploads/tg_{id}_photo_{num}@{date}.jpg"
            // Real file path in photos dir: "photo_{num}@{date}.jpg"

            if (product.imageUrl) {
                const originalPath = product.imageUrl;
                // Extract filename: "tg_30_photo_1@06-04-2019_09-57-33.jpg"
                const filename = path.basename(originalPath);

                // Remove 'tg_{id}_' prefix to Match file in photos directory
                // Pattern: tg_30_photo_1... -> photo_1...
                // regex: ^tg_\d+_
                const localFilename = filename.replace(/^tg_\d+_/, '');
                const localFilePath = path.join(PHOTOS_DIR, localFilename);

                if (fs.existsSync(localFilePath)) {
                    console.log(`Uploading image for product ${product.id}: ${localFilename}`);
                    try {
                        const result = await cloudinary.uploader.upload(localFilePath, {
                            folder: "tg_miniapp_products",
                            use_filename: true,
                            unique_filename: false
                        });
                        newProduct.images.push(result.secure_url);
                        console.log(`   -> Uploaded: ${result.secure_url}`);
                    } catch (uploadErr) {
                        console.error(`   -> Failed to upload ${localFilename}:`, uploadErr.message);
                    }
                } else {
                    console.warn(`   -> File not found locally: ${localFilePath}`);
                }
            }

            newProducts.push(newProduct);
            processedCount++;

            // Optional: Rate limiting to avoid hitting Cloudinary limits too fast
            // await new Promise(r => setTimeout(r, 200)); 
        }

        console.log(`Migration complete. Saving ${newProducts.length} products to products.json...`);
        fs.writeFileSync(DEST_PRODUCTS_PATH, JSON.stringify(newProducts, null, 2));
        console.log('Done!');

    } catch (err) {
        console.error('Migration failed:', err);
    }
}

migrateImages();
