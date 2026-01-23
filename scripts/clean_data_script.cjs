const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, '../scraped_data/products.json');
const destPath = path.join(__dirname, '../products.json');

try {
    const rawData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

    const cleanText = (text) => {
        if (!text) return '';
        let cleaned = text;
        // Remove phone numbers
        cleaned = cleaned.replace(/09\d{8}/g, '');
        // Remove prices (e.g. 100 birr, 100 ETB, 100.00 ETB)
        cleaned = cleaned.replace(/\b\d+(?:[.,]\d+)?\s*(?:birr|ETB)\b/ig, '');
        // Remove locations and common spam words
        cleaned = cleaned.replace(/\b(?:Megenagna|Metebaber|Meteba|building|floor|shop|Address|Contact|Call|text|inquiries|second|only)\b/ig, '');
        // Remove "Sold out" etc
        cleaned = cleaned.replace(/sold\s*out/ig, '');
        // Remove telegram usernames
        cleaned = cleaned.replace(/@\w+/g, '');
        // Remove links
        cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, '');
        // Remove emojis
        cleaned = cleaned.replace(/[\u{1F600}-\u{1F6FF}\u{2700}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, '');
        // Trim and clean whitespace
        cleaned = cleaned.replace(/\s+/g, ' ').trim();
        // Remove leading/trailing non-alphanumeric (simple check)
        cleaned = cleaned.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '');
        return cleaned;
    };

    const extractPhone = (text) => {
        const match = text.match(/(09\d{8})/);
        return match ? match[1] : null;
    };

    const extractTelegram = (text) => {
        const match = text.match(/(@\w+)/);
        return match ? match[1] : null;
    };

    const isGarbage = (item) => {
        const text = (item.name + ' ' + item.description).toLowerCase();
        if (text.includes('sold out')) return true;
        if (text.includes('we buy')) return true;
        if (text.includes('betting')) return true;
        if (text.includes('promo code')) return true;
        if (text.includes('1xbet')) return true;
        if (!item.imageUrl) return true;

        return false;
    };

    const cleanedData = rawData.map(item => {
        if (isGarbage(item)) return null;

        const combinedText = (item.name + ' ' + item.description);
        const phone = extractPhone(combinedText);
        const telegram = extractTelegram(combinedText);

        const cleanTitle = cleanText(item.name);
        const cleanDescription = cleanText(item.description);

        if (cleanTitle.length < 3) return null; // Title too short

        // Fix image path to be absolute for server
        let imagePath = item.imageUrl;
        if (imagePath && !imagePath.startsWith('/') && !imagePath.startsWith('http')) {
            imagePath = '/' + imagePath;
        }

        return {
            id: parseInt(item.id) || Date.now() + Math.floor(Math.random() * 1000), // Ensure ID is number if possible
            title: cleanTitle,
            price: parseFloat(item.price) || 0,
            description: cleanDescription,
            category: item.category || 'Other',
            department: 'Electronics',
            variations: [],
            images: [imagePath],
            seller_phone: phone,
            telegram_username: telegram
        };
    }).filter(item => item !== null);

    fs.writeFileSync(destPath, JSON.stringify(cleanedData, null, 2));
    console.log(`Successfully cleaned ${cleanedData.length} products and saved to products.json`);

} catch (err) {
    console.error('Error cleaning data:', err);
}
