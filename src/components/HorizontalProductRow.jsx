import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Package } from 'lucide-react';
import { motion } from 'framer-motion';

const HorizontalProductRow = ({ title, products }) => {
    const navigate = useNavigate();

    if (!products || products.length === 0) return null;

    return (
        <div className="py-2">
            <div className="flex items-center justify-between px-4 mb-2">
                <h3 className="text-base font-bold text-[var(--tg-theme-text-color)]">{title}</h3>
                <button
                    onClick={() => {
                        // Scroll to main product grid
                        const productGrid = document.querySelector('[data-product-grid]');
                        if (productGrid) {
                            productGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }}
                    className="text-[var(--tg-theme-link-color)] text-xs font-medium flex items-center gap-0.5 active:opacity-70 transition-opacity"
                >
                    See All <ArrowRight size={12} />
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-2 snap-x"
            >
                {products.map((product, idx) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="min-w-[140px] w-[140px] snap-start flex flex-col gap-1.5 cursor-pointer"
                    >
                        <div className="w-full aspect-[4/5] bg-[var(--tg-theme-bg-color)] rounded-lg overflow-hidden border border-[var(--tg-theme-section-separator-color)] relative">
                            {product.images && product.images.length > 0 ? (
                                <img
                                    src={product.images[0]}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    decoding="async"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[var(--tg-theme-hint-color)] bg-[var(--tg-theme-secondary-bg-color)]">
                                    <Package size={24} />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <h4 className="text-[var(--tg-theme-text-color)] text-sm font-bold line-clamp-1">{product.title}</h4>
                            {product.salePrice > 0 && product.salePrice < product.price ? (
                                <div className="flex gap-1.5 items-baseline">
                                    <span className="text-red-500 text-sm font-bold">{Math.floor(product.salePrice)} ETB</span>
                                    <span className="text-[var(--tg-theme-hint-color)] text-xs line-through">{Math.floor(product.price)}</span>
                                </div>
                            ) : (
                                <p className="text-[var(--tg-theme-button-color)] text-sm font-bold">{Math.floor(product.price)} ETB</p>
                            )}
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default HorizontalProductRow;
