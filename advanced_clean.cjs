const fs = require('fs');
const path = require('path');
// const htmlEntities = require('he'); // Removed dependency

const PRODUCTS_PATH = path.join(__dirname, 'products.json');

// Helper to decode HTML entities
function decodeEntities(text) {
    return text.replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&apos;/g, "'")
        .replace(/&#39;/g, "'");
}

try {
    const rawData = fs.readFileSync(PRODUCTS_PATH, 'utf8');
    const products = JSON.parse(rawData);

    // Regex constants
    // Matches @handle words
    const telegramHandleRegex = /@\w+/g;

    // Matches "Price ... birr", "500 birr only", etc.
    // Be careful not to match descriptive numbers like "500 GB"
    // Pattern: Newline or Start -> optional "Price" -> Number -> "birr" or "ETB" 
    const priceTextRegex = /(?:Price\s*[-–:]*\s*)?(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:birr|ETB|only)\s*/gi;

    // Matches specific store address we see a lot
    const addressRegex = /Megenagna\s*Metebaber\s*Building\s*(?:second\s*floor)?/gi;
    const addressRegex2 = /Megenagna\s*metebaber\s*building\s*/gi;
    const addressRegex3 = /(?:our shop is )?A7/gi; // Shop name mention in text

    // Matches "Sold out" prefixes
    const soldOutTitleRegex = /^[-\s]*(?:sold out|out of stock)[-\s]*/i;

    // Matches "Contact ...", "Call ...", "Join ..."
    const contactRegex = /(?:Contact|Text|Call|Join)\s*(?:us|me)?\s*.*$/gim;

    const cleanedProducts = products.map(product => {
        let title = product.title || '';
        let description = product.description || '';

        // --- 1. Clean Title ---
        title = decodeEntities(title);
        // Remove "Sold out" prefix from title
        title = title.replace(soldOutTitleRegex, '');
        // Remove repetitive "100.00 ETB only" from title if it exists
        title = title.replace(/\d+(\.\d{2})?\s*(?:ETB|birr)\s*(?:only)?/gi, '');
        // Remove address from title if present
        title = title.replace(/Megenagna Meteba\w*/gi, '');

        title = title.trim();
        // Remove trailing hyphens
        title = title.replace(/^[-\s]+|[-\s]+$/g, '');

        // --- 2. Clean Description ---
        description = decodeEntities(description);

        // Remove Telegram handles
        description = description.replace(telegramHandleRegex, '');

        // Remove Address blurb
        description = description.replace(addressRegex, '');
        description = description.replace(addressRegex2, '');
        description = description.replace(addressRegex3, '');

        // Remove Price mentions (since we have price field)
        // We replace it with nothing, assuming the price field is correct
        description = description.replace(priceTextRegex, '');

        // Remove Contact/Join lines (usually at the end)
        description = description.replace(contactRegex, '');

        // Remove "Discount available..." if desired? User asked to remove unnecessary data. 
        // Keeping "Discount" might be useful sales info, so I'll leave it unless it's pure boilerplate.

        // Clean up whitespace
        // collapse multiple newlines
        description = description.replace(/\n\s*\n/g, '\n');
        // collapse spaces
        description = description.replace(/[ \t]+/g, ' ');

        description = description.trim();

        // If description became empty, set a default?
        // if (!description) description = product.category; 

        return {
            ...product,
            title: title,
            description: description
        };
    });

    // Filter out items that might have been "Sold out" and are now empty titles? 
    // Or just keep them. User said "fix labeling".
    // I will keep them but with cleaned titles.

    fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(cleanedProducts, null, 2));
    console.log('Successfully advanced cleaned product data.');

} catch (err) {
    console.error('Error processing products:', err);
}
