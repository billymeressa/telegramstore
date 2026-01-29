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
            className="group block bg-[var(--tg-theme-bg-color)] rounded-lg overflow-hidden cursor-pointer relative shadow-sm hover:shadow-md transition-shadow"
        >
            {/* Image Container */}
            <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
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
                        <Package size={32} />
                    </div>
                )}

                {/* Discount Badge - Temu Style (Red Flag) */}
                {discountPercentage > 0 && (
                    <div className="absolute top-0 left-0 bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-lg z-10 shadow-sm">
                        -{discountPercentage}%
                    </div>
                )}

                {/* Sold Out Overlay */}
                {!product.isUnique && product.stock === 0 && (!product.variations || product.variations.length === 0) && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 backdrop-blur-[1px]">
                        <span className="text-white font-bold border border-white px-2 py-0.5 text-[10px] uppercase tracking-wider transform -rotate-12">Sold Out</span>
                    </div>
                )}

                {/* Wishlist Button */}
                <button
                    onClick={handleWishlist}
                    className="absolute top-1 right-1 p-1.5 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full text-gray-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm"
                >
                    <Heart
                        size={14}
                        className={isWishlisted ? 'fill-danger text-danger' : 'text-gray-500'}
                    />
                </button>

                {/* Low Stock / Flash Sale Footer Overlay */}
                {(showFlashSale || ((product.forceLowStockDisplay || (product.stock > 0 && product.stock < 10)) && (!product.variations || product.variations.length === 0))) && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 pt-4 flex items-end justify-between">
                        {showFlashSale && <FlashSaleTimer className="text-white scale-75 origin-bottom-left" />}
                        {(product.forceLowStockDisplay || (product.stock > 0 && product.stock < 10)) && (
                            <span className="text-[9px] font-bold text-red-50 bg-red-600/90 px-1 py-0.5 rounded">
                                Only {product.stock} left
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Info Container */}
            <div className="p-2 flex flex-col gap-1">
                {/* Title */}
                <h3 className="text-gray-800 text-[11px] font-normal leading-tight line-clamp-2 min-h-[2.2em]">
                    {product.title}
                </h3>

                {/* Price Block - Temu Style */}
                <div className="flex items-baseline gap-1 flex-wrap mt-0.5">
                    {/* Main Price */}
                    <div className="text-primary font-bold text-base leading-none">
                        <span className="text-[10px] font-medium mr-0.5">ETB</span>
                        {product.variations && product.variations.length > 0
                            ? Math.floor(Math.min(...product.variations.map(v => v.price)))
                            : Math.floor(product.price)
                        }
                    </div>

                    {/* Original Price */}
                    {(product.originalPrice > product.price || (product.variations && product.variations[0]?.originalPrice)) && (
                        <div className="text-gray-400 text-[9px] line-through">
                            ETB {Math.floor(product.originalPrice || (product.variations ? Math.max(...product.variations.map(v => v.originalPrice || 0)) : 0))}
                        </div>
                    )}
                </div>

                {/* Trust / Social Proof */}
                <div className="flex items-center justify-between mt-1">
                    <span className="text-[9px] text-gray-500 bg-gray-100 px-1 py-0.5 rounded">
                        {product.isUnique ? 'Unique' : '100+ sold'}
                    </span>
                    {/* Add To Cart Button */}
                    <button
                        onClick={handleAdd}
                        className={`p-1.5 rounded-full shadow-sm active:scale-90 transition-all ${isAdded ? 'bg-success text-white' : 'border border-primary text-primary hover:bg-primary hover:text-white'}`}
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
