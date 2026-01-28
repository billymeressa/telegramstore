import { useNavigate } from 'react-router-dom';
import { Package, Heart, ShoppingCart, CheckCircle } from 'lucide-react';
import { useState } from 'react';

function ProductCard({ product, onAdd, isWishlisted, onToggleWishlist }) {
    const navigate = useNavigate();
    const [isAdded, setIsAdded] = useState(false);

    const handleAdd = (e) => {
        e.stopPropagation();
        onAdd(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const handleWishlist = (e) => {
        e.stopPropagation();
        onToggleWishlist();
    };

    return (
        <div
            onClick={() => navigate(`/product/${product.id}`)}
            className="bg-[var(--tg-theme-bg-color)] rounded-xl overflow-hidden cursor-pointer transition-shadow shadow-sm border border-[var(--tg-theme-section-separator-color)] hover:shadow-md active:scale-95 transition-transform flex flex-col h-full relative"
        >
            {/* Wishlist Button */}
            <button
                onClick={handleWishlist}
                className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm active:scale-90 transition-transform"
            >
                <Heart
                    size={16}
                    className={`transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                />
            </button>

            {/* Image */}
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
            </div>

            {/* Content */}
            <div className="p-2.5 flex flex-col gap-1 text-left flex-grow">
                <h3 className="text-[var(--tg-theme-text-color)] text-sm leading-tight line-clamp-2 font-bold flex-grow">
                    {product.title}
                </h3>

                <div className="flex items-end justify-between mt-auto pt-2">
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-0.5">
                            {product.variations && product.variations.length > 0 ? (
                                <>
                                    <span className="text-[var(--tg-theme-text-color)] text-base font-extrabold">
                                        {Math.floor(Math.min(...product.variations.map(v => v.price)))}
                                    </span>
                                    <span className="text-[var(--tg-theme-text-color)] text-xs font-normal mx-0.5">-</span>
                                    <span className="text-[var(--tg-theme-text-color)] text-base font-extrabold">
                                        {Math.floor(Math.max(...product.variations.map(v => v.price)))}
                                    </span>
                                </>
                            ) : (
                                <span className="text-[var(--tg-theme-text-color)] text-lg font-extrabold">
                                    {Math.floor(product.price)}
                                </span>
                            )}
                            <span className="text-[var(--tg-theme-hint-color)] text-xs font-normal ml-0.5">Birr</span>
                        </div>
                    </div>

                    {/* Quick Add Button */}
                    <button
                        onClick={handleAdd}
                        disabled={product.stock === 0 && !product.isUnique && (!product.variations || product.variations.length === 0)}
                        className={`p-2 rounded-full shadow-sm transition-all ${isAdded
                            ? 'bg-green-100 text-green-600'
                            : 'bg-[var(--tg-theme-button-color)] text-white active:scale-90'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isAdded ? <CheckCircle size={18} /> : <ShoppingCart size={18} />}
                    </button>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-1">
                    {product.isUnique && (
                        <span className="inline-block bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-purple-200">
                            Unique
                        </span>
                    )}
                    {product.stock > 0 && product.stock < 10 && (!product.variations || product.variations.length === 0) && (
                        <span className="inline-block bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-200">
                            Low Stock
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
