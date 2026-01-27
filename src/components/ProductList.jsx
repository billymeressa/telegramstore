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

                        {/* Sold Out Badge */}
                        {!product.isUnique && product.stock === 0 && (!product.variations || product.variations.length === 0) && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                <span className="text-white font-bold border-2 border-white px-3 py-1 uppercase tracking-widest text-sm transform -rotate-12">Sold Out</span>
                            </div>
                        )}

                        {/* Unique / Low Stock Badges */}
                        {product.isUnique ? (
                            <div className="absolute top-2 left-2 bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-10 border border-purple-200">
                                {product.stockStatus || 'Unique Find'}
                            </div>
                        ) : (
                            product.stock > 0 && product.stock < 10 && (!product.variations || product.variations.length === 0) && (
                                <div className="absolute top-2 left-2 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-10 border border-red-200">
                                    Low Stock
                                </div>
                            )
                        )}
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

