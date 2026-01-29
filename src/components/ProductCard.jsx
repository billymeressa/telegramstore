import { useNavigate } from 'react-router-dom';
import { Package, Heart, ShoppingCart, CheckCircle } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import useStore from '../store/useStore';
import FlashSaleTimer from './FlashSaleTimer';

function ProductCard({ product, onAdd, isWishlisted, onToggleWishlist }) {
    const navigate = useNavigate();
    const [isAdded, setIsAdded] = useState(false);
    const settings = useStore(state => state.settings);
    const intensity = settings.global_sale_intensity || 'medium';

    const showFlashSale = useMemo(() => {
        if (product.isFlashSale) return true; // Backend override

        if (intensity === 'low') return false;

        // Deterministic random based on ID/Title
        let hash = 0;
        const str = String(product.id || product.title);
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        const rand = Math.abs(hash) % 100; // 0-99

        if (intensity === 'high') return rand < 50; // 50% chance
        if (intensity === 'medium') return rand < 20; // 20% chance
        return false;
    }, [intensity, product.id, product.title, product.isFlashSale]);

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

    const discountPercentage = product.originalPrice && product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <div
            onClick={() => navigate(`/product/${product.id}`)}
            className="group block bg-[var(--tg-theme-bg-color)] rounded-lg overflow-hidden cursor-pointer relative shadow-sm hover:shadow-md transition-shadow will-change-transform"
        >
            {/* Image Container - Aspect 1:1 or slightly cooler */}
            <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                {product.images && product.images.length > 0 ? (
                    <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                        <Package size={40} />
                    </div>
                )}

                {/* Overlays */}
                {/* Discount Badge - Very Prominent */}
                {discountPercentage > 0 && (
                    <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[10px] font-extrabold px-1.5 py-1 rounded-bl-lg">
                        -{discountPercentage}%
                    </div>
                )}

                {/* Sold Out Overlay */}
                {!product.isUnique && product.stock === 0 && (!product.variations || product.variations.length === 0) && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 backdrop-blur-[1px]">
                        <span className="text-white font-bold border-2 border-white px-3 py-1 text-xs uppercase tracking-widest transform -rotate-12">Sold Out</span>
                    </div>
                )}

                {/* Wishlist Button - Subtle top right */}
                <button
                    onClick={handleWishlist}
                    className="absolute top-1 left-1 p-1.5 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 active:scale-90"
                >
                    <Heart
                        size={16}
                        className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-white'}
                    />
                </button>

                {/* Low Stock / Flash Sale Footer Overlay */}
                {(showFlashSale || ((product.forceLowStockDisplay || (product.stock > 0 && product.stock < 10)) && (!product.variations || product.variations.length === 0))) && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6 flex items-end justify-between">
                        {showFlashSale && <FlashSaleTimer className="text-white scale-75 origin-bottom-left" />}
                        {(product.forceLowStockDisplay || (product.stock > 0 && product.stock < 10)) && (
                            <span className="text-[10px] font-bold text-red-100 bg-red-600/90 px-1.5 py-0.5 rounded">
                                Alert: Low Stock
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Info Container */}
            <div className="p-2 flex flex-col gap-1">
                {/* Title */}
                <h3 className="text-[var(--tg-theme-text-color)] text-xs font-normal leading-snug line-clamp-2 min-h-[2.5em]">
                    {product.title}
                </h3>

                {/* Price Block - Temu Style */}
                <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                    {/* Main Price */}
                    <div className="text-[var(--tg-theme-button-color)] font-bold text-base leading-none">
                        <span className="text-[10px] align-top font-medium">ETB</span>
                        {product.variations && product.variations.length > 0
                            ? Math.floor(Math.min(...product.variations.map(v => v.price)))
                            : Math.floor(product.price)
                        }
                    </div>

                    {/* Original Price */}
                    {(product.originalPrice > product.price || (product.variations && product.variations[0]?.originalPrice)) && (
                        <div className="text-[var(--tg-theme-hint-color)] text-[10px] line-through decoration-gray-400">
                            ETB {Math.floor(product.originalPrice || (product.variations ? Math.max(...product.variations.map(v => v.originalPrice || 0)) : 0))}
                        </div>
                    )}
                </div>

                {/* Rating / Sold Count (Fake Social Proof for now to match style, or real logic if available) */}
                <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] text-[var(--tg-theme-hint-color)]">
                        {product.isUnique ? '1/1 Available' : '4.8 ★'}
                    </span>
                    {/* Add To Cart Button - Circle Icon bottom right */}
                    <button
                        onClick={handleAdd}
                        className={`ml-auto p-1.5 rounded-full shadow-sm active:scale-90 transition-all ${isAdded ? 'bg-green-500 text-white' : 'border border-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-color)] hover:bg-[var(--tg-theme-button-color)] hover:text-white'}`}
                        disabled={product.stock === 0 && !product.isUnique && (!product.variations || product.variations.length === 0)}
                    >
                        {isAdded ? <CheckCircle size={14} /> : <ShoppingCart size={14} />}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Memoize to prevent re-renders when parent scroll triggers state changes that don't affect card
export default React.memo(ProductCard, (prevProps, nextProps) => {
    return prevProps.product.id === nextProps.product.id &&
        prevProps.isWishlisted === nextProps.isWishlisted &&
        prevProps.product.stock === nextProps.product.stock && // Check stock updates
        prevProps.product.price === nextProps.product.price;   // Check price updates
});
