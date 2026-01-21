
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../scraped_data');
const HTML_FILE = path.join(DATA_DIR, 'messages.html');
const PHOTOS_DIR = path.join(DATA_DIR, 'photos');
const DEST_IMAGES_DIR = path.join(__dirname, '../uploads');
const OUTPUT_FILE = path.join(__dirname, '../products.json'); // Current main products file? or scraped_data/products.json?
// The user request was "get products... for the bot". Usually we want to update the bot's database or products.json.
// Let's create it in scraped_data first, then user can decide or I overwrite the main one if I am confident.
// The task says "(Optional) Integrate ... into products.json".
// Let's write to `scraped_data/products.json` first.
const OUTPUT_JSON = path.join(DATA_DIR, 'products.json');

if (!fs.existsSync(DEST_IMAGES_DIR)) {
    fs.mkdirSync(DEST_IMAGES_DIR, { recursive: true });
}

function parseHTML() {
    if (!fs.existsSync(HTML_FILE)) {
        console.error('messages.html not found!');
        return;
    }

    const html = fs.readFileSync(HTML_FILE, 'utf8');
    const products = [];

    // Split by message div to isolate messages
    // Pattern: <div class="message default clearfix" id="message
    const chunks = html.split('<div class="message default clearfix" id="message');

    // Skip the first chunk (header stuff)
    for (let i = 1; i < chunks.length; i++) {
        const chunk = chunks[i];

        // Extract ID (first digits)
        const idMatch = chunk.match(/^(\d+)"/);
        const id = idMatch ? idMatch[1] : `unknown_${i}`;

        // Extract Image Path
        // href="photos/photo_1@06-04-2019_09-57-33.jpg"
        const imgMatch = chunk.match(/href="(photos\/[^"]+)"/);
        let imagePath = null;
        if (imgMatch) {
            imagePath = imgMatch[1];
        }

        // Extract Text
        // <div class="text">\n ... </div>
        // Warning: Text might contain nested tags like <a> or <br>.
        // We capture the innerHTML of the text div essentially.
        const textMatch = chunk.match(/<div class="text">\s*([\s\S]*?)\s*<\/div>/);
        let description = '';
        if (textMatch) {
            let rawText = textMatch[1];
            // Clean up text: replace <br> with newline, remove tags, decode entities
            description = rawText
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<[^>]+>/g, '') // Remove other tags
                .trim();
        }

        // Filter criteria: Must have image OR significant text?
        // Let's stick to "products usually have images".
        if (imagePath) {
            // Process Image
            const srcFilename = path.basename(imagePath);
            const sourcePath = path.join(DATA_DIR, imagePath); // scraped_data/photos/xxx.jpg

            // Checking if file exists (some exports might have broken links or missing files)
            // Telegram export puts photos in `photos/` alongside `messages.html`.
            // My listing showed `photos` dir in `scraped_data`.

            if (fs.existsSync(sourcePath)) {
                // Determine destination
                const destFilename = `tg_${id}_${srcFilename}`;
                const destPath = path.join(DEST_IMAGES_DIR, destFilename);

                // Copy file
                fs.copyFileSync(sourcePath, destPath);

                // Add to products list
                products.push({
                    id: id,
                    name: extractTitle(description) || `Product ${id}`,
                    description: description,
                    price: extractPrice(description), // Helper to find price
                    imageUrl: `uploads/${destFilename}`, // Relative path for the webapp
                    category: 'Electronics' // Default category
                });
            } else {
                console.warn(`Image file not found: ${sourcePath}`);
            }
        }
    }

    console.log(`Parsed ${products.length} products.`);
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(products, null, 2));
}

function extractPrice(text) {
    // Regex for price: "100.00 ETB", "400 birr", "Price 500"
    // Heuristic: Look for numbers followed strictly by ETB or Birr, or preceded by Price
    const match = text.match(/(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:birr|ETB|Br)/i);
    if (match) {
        return parseFloat(match[1].replace(/,/g, ''));
    }
    return 0;
}

function extractTitle(text) {
    // Return first line or first few words
    const firstLine = text.split('\n')[0];
    return firstLine.substring(0, 50).trim();
}

parseHTML();
