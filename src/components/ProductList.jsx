import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { useState, useEffect } from 'react';





function ProductList({ products }) {
    const navigate = useNavigate();

    return (
        <div
            className="grid grid-cols-2 gap-2 p-2 pb-24"
        >
            {products.map((product, index) => (
                <div
                    key={`${product.id}-${index}`}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="bg-[var(--tg-theme-bg-color)] rounded-xl overflow-hidden cursor-pointer transition-shadow shadow-sm border border-[var(--tg-theme-section-separator-color)] hover:shadow-md active:scale-95 transition-transform"
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

                        {/* Sold out / Low stock badge could go here if needed, but not requested specifically for ProductList yet, keeping it clean */}
                    </div>

                    <div className="p-2.5 flex flex-col gap-1 text-left">
                        <h3 className="text-[var(--tg-theme-text-color)] text-base leading-tight line-clamp-2 font-bold">
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
                </div>
            ))}
        </div>
    );
}

export default ProductList;

