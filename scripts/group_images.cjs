const fs = require('fs');
const path = require('path');

const MESSAGES_PATH = path.join(__dirname, '../scraped_data/messages.html');
const PHOTOS_DIR = path.join(__dirname, '../scraped_data/photos');
const UPLOADS_DIR = path.join(__dirname, '../uploads');
const PRODUCTS_PATH = path.join(__dirname, '../products.json');

try {
    const html = fs.readFileSync(MESSAGES_PATH, 'utf8');
    const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));

    // Split messages. 
    // Format: <div class="message ... id="message123">
    const messages = html.split('<div class="message');

    // Map productId -> Set of photo filenames (from scraped_data/photos)
    const productPhotos = {};
    let currentGroupId = null;

    messages.forEach(chunk => {
        // Extract ID
        const idMatch = chunk.match(/id="message(-?\d+)"/);
        if (!idMatch) return;
        const id = parseInt(idMatch[1]); // Ensure integer
        if (isNaN(id)) return;

        // Check if it has class "service" - ignore
        if (chunk.includes('class="box service"') || chunk.includes('class="message service"')) {
            currentGroupId = null; // Reset group execution
            return;
        }

        // Check text content
        // Simple check: does it have <div class="text">?
        const hasText = chunk.includes('<div class="text">');

        // Extract photos
        const photoMatches = chunk.matchAll(/href="photos\/(.*?)"/g);
        const photos = [];
        for (const match of photoMatches) {
            photos.push(match[1]);
        }

        if (hasText) {
            // New group (Product)
            currentGroupId = id;
            if (photos.length > 0) {
                productPhotos[currentGroupId] = new Set(photos);
            } else {
                productPhotos[currentGroupId] = new Set();
            }
        } else {
            // Continuation (Album) ?? Only if we have a current group and this message has photos
            if (currentGroupId && photos.length > 0) {
                photos.forEach(p => productPhotos[currentGroupId].add(p));
            } else if (!hasText) {
                // If it has no text and no photos, it's irrelevant, but keeps the group alive?
                // Usually "joined" messages are albums.
                // If it's a completely unrelated message (e.g. forward without text?), it might be risky.
                // But given the export format for albums, this is the pattern.
            }
        }
    });

    // Update products.json
    let updatedCount = 0;
    const updatedProducts = products.map(product => {
        const id = product.id;
        if (!productPhotos[id]) return product;

        const photos = Array.from(productPhotos[id]);
        if (photos.length === 0) return product;

        // Copy/Rename photos to uploads
        const newImagePaths = photos.map((photoFilename, index) => {
            const ext = path.extname(photoFilename);
            const source = path.join(PHOTOS_DIR, photoFilename);

            // To ensure uniqueness and match existing pattern roughly
            // product.images[0] was "uploads/tg_ID_photo_1..."
            // We can rename them all to tg_{id}_{index}.jpg
            const newFilename = `tg_${id}_${index}${ext}`;
            const dest = path.join(UPLOADS_DIR, newFilename);

            if (fs.existsSync(source)) {
                fs.copyFileSync(source, dest);
                return `/uploads/${newFilename}`;
            } else {
                console.warn(`Warning: Source photo not found: ${source}`);
                return null;
            }
        }).filter(p => p !== null);

        // Update product images if we found any valid ones
        if (newImagePaths.length > 0) {
            // Determine if we actually added more images or just replaced the single one with same content
            if (newImagePaths.length > 1) updatedCount++;

            return {
                ...product,
                images: newImagePaths
            };
        }
        return product;
    });

    fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(updatedProducts, null, 2));
    console.log(`Updated products with grouped images. Total products with >1 images: ${updatedCount}`);

} catch (err) {
    console.error('Error grouping images:', err);
}
