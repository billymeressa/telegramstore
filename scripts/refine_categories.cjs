
const fs = require('fs');
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, '..', 'products.json');
const BACKUP_PATH = path.join(__dirname, '..', 'products.json.bak');

// Read products
if (!fs.existsSync(PRODUCTS_PATH)) {
    console.error(`File not found: ${PRODUCTS_PATH}`);
    process.exit(1);
}

const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));

// Create backup
fs.writeFileSync(BACKUP_PATH, JSON.stringify(products, null, 2));
console.log(`Backup created at ${BACKUP_PATH}`);

let updatedCount = 0;

const newProducts = products.map(product => {
    // Only touch Electronics or if category is "Other" but clearly tech
    if (product.department !== 'Electronics' && product.category !== 'Other') {
        return product;
    }

    const title = (product.title || '').toLowerCase();
    const desc = (product.description || '').toLowerCase();
    const combined = title + ' ' + desc;

    let newCategory = product.category;

    // Categorization Logic
    if (combined.includes('hard disk') || combined.includes('hdd') || combined.includes('ssd') || combined.includes('external hard') || combined.includes('internal hard') || combined.includes('transcend') || combined.includes('wd elements') || combined.includes('enclosure')) {
        newCategory = 'Hard Drives';
    } else if (combined.includes('flash drive') || combined.includes('sandisk') || combined.includes('usb drive') || combined.includes('pen drive') || combined.includes('class 10')) {
        newCategory = 'Storage'; // General Flash/Storage
    } else if (combined.includes('keyboard') && !combined.includes('laptop')) {
        newCategory = 'Keyboards';
    } else if (combined.includes('mouse') && !combined.includes('laptop')) {
        newCategory = 'Mice';
    } else if (combined.includes('headset') || combined.includes('earphone') || combined.includes('headphone') || combined.includes('speaker') || combined.includes('audio') || combined.includes('airpods')) {
        newCategory = 'Audio';
    } else if (combined.includes('joystick') || combined.includes('controller') || combined.includes('ps4') || combined.includes('ps3') || combined.includes('ps2') || combined.includes('gamepad') || combined.includes('gaming')) {
        newCategory = 'Gaming';
    } else if (combined.includes('router') || combined.includes('modem') || combined.includes('tp-link') || combined.includes('4g') || combined.includes('network cable')) {
        newCategory = 'Networking';
    } else if ((combined.includes('cable') || combined.includes('adapter') || combined.includes('converter') || combined.includes('vga') || combined.includes('hdmi') || combined.includes('usb hub') || combined.includes('charger')) && !combined.includes('laptop')) {
        newCategory = 'Cables & Adapters';
    } else if ((combined.includes('laptop') || combined.includes('macbook') || combined.includes('notebook') || combined.includes('thinkpad') || combined.includes('elitebook') || combined.includes('probook') || combined.includes('hp pavilion') || combined.includes('dell') || combined.includes('lenovo')) && !combined.includes('keyboard') && !combined.includes('screen') && !combined.includes('battery') && !combined.includes('adapter') && !combined.includes('charger')) {
        // Strict laptop check: must have laptop keywords and NOT accessory keywords
        newCategory = 'Laptops';
    }

    if (newCategory !== product.category) {
        updatedCount++;
        // console.log(`[${product.id}] ${product.title} : ${product.category} -> ${newCategory}`);
        return { ...product, category: newCategory, department: 'Electronics' }; // Ensure department is Electronics
    }

    return product;
});

fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(newProducts, null, 2));
console.log(`Updated ${updatedCount} products.`);
console.log('Done.');
