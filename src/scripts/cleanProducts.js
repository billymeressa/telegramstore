import fs from 'fs';
import path from 'path';

// Helper for Title Case
const toTitleCase = (str) => {
    return str.replace(
        /\w\S*/g,
        (txt) => {
            if (['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'of'].includes(txt.toLowerCase())) {
                return txt.toLowerCase();
            }
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    ).replace(/^\w/, (c) => c.toUpperCase()); // Always cap first word
};

// Common Replacements map
const REPLACEMENTS = [
    { regex: /\bgb\b/gi, replacement: 'GB' },
    { regex: /\bmb\b/gi, replacement: 'MB' },
    { regex: /\btb\b/gi, replacement: 'TB' },
    { regex: /\bssd\b/gi, replacement: 'SSD' },
    { regex: /\bhdd\b/gi, replacement: 'HDD' },
    { regex: /\bram\b/gi, replacement: 'RAM' },
    { regex: /\busb\b/gi, replacement: 'USB' },
    { regex: /\bpc\b/gi, replacement: 'PC' },
    { regex: /\bps2\b/gi, replacement: 'PS2' },
    { regex: /\bps3\b/gi, replacement: 'PS3' },
    { regex: /\bps4\b/gi, replacement: 'PS4' },
    { regex: /\bps5\b/gi, replacement: 'PS5' },
    { regex: /\bhd\b/gi, replacement: 'HD' },
    { regex: /\bfhd\b/gi, replacement: 'FHD' },
    { regex: /\buhd\b/gi, replacement: 'UHD' },
    { regex: /\bkw\b/gi, replacement: 'kW' },
    { regex: /\bmah\b/gi, replacement: 'mAh' },
    { regex: /\biphone\b/gi, replacement: 'iPhone' },
    { regex: /\bios\b/gi, replacement: 'iOS' },
    { regex: /\bmacbook\b/gi, replacement: 'MacBook' },
    { regex: /\bhp\b/gi, replacement: 'HP' },
    { regex: /\blenovo\b/gi, replacement: 'Lenovo' },
    { regex: /\bsamsung\b/gi, replacement: 'Samsung' },
    { regex: /\btoshiba\b/gi, replacement: 'Toshiba' },
    { regex: /\bdell\b/gi, replacement: 'Dell' },
    { regex: /\basus\b/gi, replacement: 'Asus' },
    { regex: /\bacer\b/gi, replacement: 'Acer' },
    { regex: /\bsony\b/gi, replacement: 'Sony' },
    { regex: /\bgopro\b/gi, replacement: 'GoPro' },
    { regex: /\bnikon\b/gi, replacement: 'Nikon' },
    { regex: /\bcanon\b/gi, replacement: 'Canon' },
    { regex: /\bandroid\b/gi, replacement: 'Android' },
    { regex: /\bgoogle\b/gi, replacement: 'Google' },
    { regex: /\bxiomi\b/gi, replacement: 'Xiaomi' },
    { regex: /\bxiaomi\b/gi, replacement: 'Xiaomi' },
    { regex: /\bmi\b/gi, replacement: 'Mi' },
    { regex: /\bcore\s?i3\b/gi, replacement: 'Core i3' },
    { regex: /\bcore\s?i5\b/gi, replacement: 'Core i5' },
    { regex: /\bcore\s?i7\b/gi, replacement: 'Core i7' },
    { regex: /\bcore\s?i9\b/gi, replacement: 'Core i9' },
    { regex: /\bgtx\b/gi, replacement: 'GTX' },
    { regex: /\brtx\b/gi, replacement: 'RTX' },
    { regex: /\bwi-fi\b/gi, replacement: 'Wi-Fi' },
    { regex: /\bwifi\b/gi, replacement: 'Wi-Fi' },
    { regex: /\bbluetooth\b/gi, replacement: 'Bluetooth' },
    { regex: /\bhdmi\b/gi, replacement: 'HDMI' },
    { regex: /\bvga\b/gi, replacement: 'VGA' },
    { regex: /\blte\b/gi, replacement: 'LTE' },
    { regex: /\b4g\b/gi, replacement: '4G' },
    { regex: /\b5g\b/gi, replacement: '5G' },
    { regex: /&quot;/g, replacement: '"' },
    { regex: /&amp;/g, replacement: '&' },
    { regex: /■/g, replacement: '' },
    { regex: /lAlmost/g, replacement: 'Almost' },
    { regex: /_/g, replacement: ' ' }
];

const GARBAGE_REGEXES = [
    /Price\s*:?(\s*To)?\s*\d*\s*(or|-)?\s*(Join|Call).*/yi,
    /Put your price.*/yi,
    /Join (us )?for more.*/yi,
    /Call\s*:?\s*(\+?251|09)\d{8}/g,
    /For more info.*/yi,
    /Contact @.*/yi,
    /Dm @.*/yi,
    /Or Join.*/yi,
    /Price\s*[-–:]?\s*$/yi,
    /Price\s*:?\s*To\s*$/yi,
    /Price\s*[-:]?\s*$/yi,
    /Price\s*:?\s*or\s*$/yi,
    /To or Join.*/yi,
    /.*join for more.*/yi, // Aggressive: remove any line with this
    /price\s+(is\s+)?to\s+or.*/yi,
    /price\s+or.*/yi
];

const cleanText = (text) => {
    if (!text) return '';
    let cleaned = text;

    // Apply specific replacements first
    REPLACEMENTS.forEach(({ regex, replacement }) => {
        cleaned = cleaned.replace(regex, replacement);
    });

    // Remove garbage phrases
    GARBAGE_REGEXES.forEach((regex) => {
        cleaned = cleaned.replace(regex, '');
    });

    // Clean up extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
};

const enhanceDescription = (desc, title) => {
    let enhanced = cleanText(desc);

    // Formatting: Ensure it ends with punctuation if not empty
    if (enhanced && !/[.!?]$/.test(enhanced)) {
        enhanced += '.';
    }

    // Formatting: Ensure it starts with uppercase
    if (enhanced) {
        enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);
    }

    // If description is very short or identical to title, try to be verbose?
    // Doing this programmatically is hard without context. 
    // We'll stick to formatting.

    // Structure: Bullets?
    // Many descriptions are comma separated or newline separated. 
    // Let's try to format specification lists.
    // e.g. "Storage 128GB, RAM 4GB" -> "- Storage: 128GB\n- RAM: 4GB" ?
    // But this might break natural sentences.

    return enhanced;
};

const run = () => {
    const rawData = fs.readFileSync(path.resolve('products_dump.json'));
    const products = JSON.parse(rawData);

    const cleanedProducts = products.map(p => {
        let newTitle = cleanText(p.title);
        // Fix title casing
        newTitle = toTitleCase(newTitle);

        let newDesc = enhanceDescription(p.description, newTitle);

        // Ensure "Original" is capitalized correctly
        newDesc = newDesc.replace(/\borginal\b/gi, 'Original');
        newTitle = newTitle.replace(/\borginal\b/gi, 'Original');

        // Remove "Price" standing alone or weird leftovers
        newDesc = newDesc.replace(/Price\s*[.:-]*\s*$/i, '');

        return {
            ...p,
            title: newTitle,
            description: newDesc
        };
    });

    fs.writeFileSync(path.resolve('clean_products.json'), JSON.stringify(cleanedProducts, null, 2));
    console.log(`Cleaned ${cleanedProducts.length} products. Check clean_products.json`);
};

run();
