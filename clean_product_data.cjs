const fs = require('fs');
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, 'products.json');

try {
    const rawData = fs.readFileSync(PRODUCTS_PATH, 'utf8');
    const products = JSON.parse(rawData);

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const phoneRegex = /(09\d{8})/g;

    const cleanedProducts = products.map(product => {
        let description = product.description || '';
        let seller_phone = product.seller_phone || null;

        // 1. Extract Phone Numbers (Ethiopian 09...)
        const phoneMatches = description.match(phoneRegex);
        if (phoneMatches && phoneMatches.length > 0) {
            // Take the first one found as the primary contact
            if (!seller_phone) {
                seller_phone = phoneMatches[0];
            }
            // Remove ALL found phone numbers from description
            description = description.replace(phoneRegex, '').trim();
        }

        // 2. Remove URLs
        description = description.replace(urlRegex, '').trim();

        // 3. Clean up extra whitespace/newlines that might result
        description = description.replace(/\n\s*\n/g, '\n').trim();

        return {
            ...product,
            description: description,
            seller_phone: seller_phone
        };
    });

    fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(cleanedProducts, null, 2));
    console.log('Successfully cleaned product data and extracted phone numbers.');

    // Stats
    const phoneCount = cleanedProducts.filter(p => p.seller_phone).length;
    console.log(`Products with extracted phone numbers: ${phoneCount}`);

} catch (err) {
    console.error('Error processing products:', err);
}
