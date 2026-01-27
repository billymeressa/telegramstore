import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';


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
                            <img
                                src={product.images[0]}
                                alt={product.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                decoding="async"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full w-full text-[var(--tg-theme-hint-color)] bg-[var(--tg-theme-secondary-bg-color)]">
                                <Package size={32} opacity={0.5} />
                            </div>
                        )}
                        {/* Sale Tag */}
                        {product.salePrice > 0 && product.salePrice < product.price && (
                            <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-10">
                                SALE
                            </div>
                        )}
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
                                    product.salePrice > 0 && product.salePrice < product.price ? (
                                        <>
                                            <span className="text-red-600 text-lg font-extrabold">{Math.floor(product.salePrice)}</span>
                                            <span className="text-[var(--tg-theme-hint-color)] text-xs font-normal line-through ml-1">{Math.floor(product.price)}</span>
                                            <span className="text-[var(--tg-theme-hint-color)] text-xs font-normal ml-0.5">ETB</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-[var(--tg-theme-text-color)] text-lg font-extrabold">{Math.floor(product.price)}</span>
                                            <span className="text-[var(--tg-theme-hint-color)] text-xs font-normal">ETB</span>
                                        </>
                                    )
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

