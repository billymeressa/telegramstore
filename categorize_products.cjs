const fs = require('fs');
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, 'products.json');

try {
    const rawData = fs.readFileSync(PRODUCTS_PATH, 'utf8');
    const products = JSON.parse(rawData);

    const updatedProducts = products.map(product => {
        // Only classify if it's currently generic Electronics
        if (product.department === 'Electronics') {
            const title = product.title.toLowerCase();
            const desc = product.description.toLowerCase();
            const text = title + ' ' + desc;

            let newCategory = 'Other';

            if (text.includes('laptop') || text.includes('macbook') || text.includes('notebook') || text.includes('hp pavilion')) {
                newCategory = 'Laptops';
            } else if (text.includes('drive') || text.includes('disk') || text.includes('sd') || text.includes('memory') || text.includes('usb') && (text.includes('16gb') || text.includes('32gb') || text.includes('64gb') || text.includes('128gb') || text.includes('tera'))) {
                newCategory = 'Storage';
            } else if (text.includes('phone') || text.includes('samsung s') || text.includes('huawei') || text.includes('iphone') || text.includes('galaxy')) {
                newCategory = 'Phones';
            } else if (text.includes('headset') || text.includes('speaker') || text.includes('earphone') || text.includes('airpod') || text.includes('sound')) {
                newCategory = 'Audio';
            } else if (text.includes('keyboard') || text.includes('mouse') || text.includes('monitor') || text.includes('vga') || text.includes('hdmi')) {
                newCategory = 'Computer Accessories';
            } else if (text.includes('joystick') || text.includes('controller') || text.includes('game') || text.includes('ps3') || text.includes('ps4') || text.includes('console')) {
                newCategory = 'Gaming';
            } else if (text.includes('router') || text.includes('modem') || text.includes('network') || text.includes('4g') || text.includes('wifi')) {
                newCategory = 'Networking';
            } else if (text.includes('watch') || text.includes('smart') || text.includes('washer') || text.includes('opener')) {
                newCategory = 'Smart Home';
            }

            // If it was just "Electronics", update it.
            return { ...product, category: newCategory };
        }
        return product;
    });

    fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(updatedProducts, null, 2));
    console.log('Successfully updated product categories.');

    // Log some stats
    const stats = {};
    updatedProducts.forEach(p => {
        if (p.department === 'Electronics') {
            stats[p.category] = (stats[p.category] || 0) + 1;
        }
    });
    console.log('New Category Distribution:', stats);

} catch (err) {
    console.error('Error processing products:', err);
}
