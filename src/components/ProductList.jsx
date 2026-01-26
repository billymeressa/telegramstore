import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
};

function ProductList({ products }) {
    const navigate = useNavigate();

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-2 p-2 pb-24"
        >
            {products.map((product) => (
                <motion.div
                    key={product.id}
                    variants={itemVariants}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="bg-[var(--tg-theme-bg-color)] rounded-xl overflow-hidden cursor-pointer transition-shadow shadow-sm border border-[var(--tg-theme-section-separator-color)] hover:shadow-md"
                >
                    <div className="relative w-full aspect-[4/5] bg-[var(--tg-theme-secondary-bg-color)] flex items-center justify-center overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                            <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl opacity-20 grayscale">📦</span>
                        )}
                        {/* New Tag or Discount Tag Logic could go here */}
                    </div>

                    <div className="p-2.5 flex flex-col gap-1 text-left">
                        <h3 className="text-[var(--tg-theme-text-color)] text-base leading-tight line-clamp-2 min-h-[2.5em] font-bold">
                            {product.title}
                        </h3>
                        <div className="flex items-center justify-between mt-1">
                            <div className="flex items-baseline gap-0.5">
                                {product.variations && product.variations.length > 0 ? (
                                    // Show price range for products with variations
                                    <>
                                        <span className="text-[var(--tg-theme-text-color)] text-lg font-extrabold">
                                            {Math.floor(Math.min(...product.variations.map(v => v.price)))}
                                        </span>
                                        <span className="text-[var(--tg-theme-text-color)] text-sm font-normal mx-0.5">-</span>
                                        <span className="text-[var(--tg-theme-text-color)] text-lg font-extrabold">
                                            {Math.floor(Math.max(...product.variations.map(v => v.price)))}
                                        </span>
                                        <span className="text-[var(--tg-theme-hint-color)] text-xs font-normal">ETB</span>
                                    </>
                                ) : (
                                    // Show single price for regular products
                                    <>
                                        <span className="text-[var(--tg-theme-text-color)] text-lg font-extrabold">{Math.floor(product.price)}</span>
                                        <span className="text-[var(--tg-theme-hint-color)] text-xs font-normal">ETB</span>
                                    </>
                                )}
                            </div>

                        </div>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
}

export default ProductList;

