import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { connectDB, Product } from '../src/db.js';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async (localPath) => {
    try {
        const fullPath = path.join(__dirname, '..', localPath);
        if (!fs.existsSync(fullPath)) {
            console.warn(`File not found: ${fullPath}`);
            return null;
        }
        const result = await cloudinary.uploader.upload(fullPath, {
            folder: 'telegram_store_products',
        });
        return result.secure_url;
    } catch (err) {
        console.error(`Error uploading ${localPath}:`, err.message);
        return null; // Keep local path or handle error? For now, skip if failed.
    }
};

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

        console.log('Starting image uploads to Cloudinary (this may take a while)...');

        const productsToInsert = [];

        // Process each product sequentially to avoid rate limits
        for (const [index, p] of productsData.entries()) {
            const uploadedImages = [];

            for (const imgPath of p.images) {
                // Check if it's already a URL (e.g. from previous run or external source)
                if (imgPath.startsWith('http')) {
                    uploadedImages.push(imgPath);
                } else {
                    // It's a local path like "/uploads/..."
                    // Remove leading slash for path.join relative to root
                    const relativePath = imgPath.startsWith('/') ? imgPath.slice(1) : imgPath;
                    const cloudUrl = await uploadImage(relativePath);
                    if (cloudUrl) {
                        uploadedImages.push(cloudUrl);
                    } else {
                        console.warn(`Skipping image ${imgPath} for product ${p.id} due to upload failure (or missing file).`);
                    }
                }
            }

            if (uploadedImages.length > 0) {
                // Update the product object with new URLs
                p.images = uploadedImages;
                productsToInsert.push(p);
            } else {
                console.warn(`Product ${p.id} skipped - no valid images.`);
            }

            if ((index + 1) % 10 === 0) console.log(`Processed ${index + 1} products...`);
        }

        // SAVE THE UPDATED FILE so we don't lose the Cloudinary URLs
        fs.writeFileSync(productsPath, JSON.stringify(productsData, null, 2));
        console.log('Updated products.json with Cloudinary URLs');

        const dbProducts = productsToInsert.map(p => ({
            id: p.id,
            title: p.title,
            price: p.price,
            description: p.description,
            category: p.category,
            department: p.department,
            images: p.images
        }));

        await Product.insertMany(dbProducts);
        console.log(`Successfully seeded ${productsToInsert.length} products to Database with Cloudinary Images`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedProducts();
