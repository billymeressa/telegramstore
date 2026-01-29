import { connectDB, Product } from '../db.js';
import 'dotenv/config';

const verifyRotation = async () => {
    try {
        await connectDB();
        console.log("Connected to DB...");

        // 1. Reset All
        await Product.updateMany({}, {
            isFlashSale: false,
            flashSaleEndTime: null,
            forceLowStockDisplay: false
        });
        console.log("Reset cleared.");

        // 2. Mock Logic from Scheduler (Select 5 Random Premium)
        const count = 5;
        const randomProducts = await Product.aggregate([
            { $match: { price: { $gt: 1500 }, stock: { $gt: 0 } } },
            { $sample: { size: count } }
        ]);

        if (randomProducts.length > 0) {
            const ids = randomProducts.map(p => p.id);
            const endTime = new Date(Date.now() + 4 * 60 * 60 * 1000);

            await Product.updateMany(
                { id: { $in: ids } },
                {
                    isFlashSale: true,
                    flashSaleEndTime: endTime,
                    forceLowStockDisplay: true
                }
            );
            console.log(`✅ Activated Flash Sale for ${ids.length} products: ${ids.join(', ')}`);

            // Verify
            const check = await Product.find({ isFlashSale: true });
            console.log(`🔍 Found ${check.length} products with Flash Sale active.`);
            check.forEach(p => console.log(`   - ${p.title} (${p.price} Birr) :: ForceLowStock: ${p.forceLowStockDisplay}`));

        } else {
            console.log('⚠️ No premium products found.');
        }

        process.exit(0);

    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
};

verifyRotation();
