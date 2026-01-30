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

        // Use granular setting if available, otherwise fallback to intensity
        const prob = settings.system_flash_sale_prob !== undefined
            ? settings.system_flash_sale_prob
            : (intensity === 'low' ? 0 : intensity === 'high' ? 0.5 : 0.2);

        if (prob === 0) return false;

        // Deterministic random based on ID/Title
        let hash = 0;
        const str = String(product.id || product.title);
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        const rand = Math.abs(hash) % 100; // 0-99

        return rand < (prob * 100);
    }, [intensity, settings.system_flash_sale_prob, product.id, product.title, product.isFlashSale]);

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

    // Track Impression for Fresh Rotation
    React.useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Set timeout to mark as seen after 1.5s of visibility
                    const timeoutId = setTimeout(() => {
                        try {
                            const seen = JSON.parse(localStorage.getItem('seen_products') || '[]');
                            if (!seen.includes(product.id)) {
                                seen.push(product.id);
                                localStorage.setItem('seen_products', JSON.stringify(seen));
                            }
                        } catch (e) { console.error(e); }
                    }, 1500);

                    // Store ID to clear timeout if scrolled away quickly
                    entry.target.dataset.timeoutId = timeoutId;
                } else {
                    // Clear timeout if scrolled away before 1.5s
                    const timeoutId = entry.target.dataset.timeoutId;
                    if (timeoutId) {
                        clearTimeout(parseInt(timeoutId));
                        delete entry.target.dataset.timeoutId;
                    }
                }
            });
        }, { threshold: 0.6 }); // 60% of card must be visible

        const card = document.getElementById(`product-card-${product.id}`);
        if (card) observer.observe(card);

        return () => {
            if (card) observer.unobserve(card);
            observer.disconnect();
        };
    }, [product.id]);

    // Maximalist: Random loud badges for that "busy" feel
    const randomBadge = useMemo(() => {
        const badges = [
            { text: 'BEST SELLER', color: 'bg-yellow-400 text-black' },
            { text: 'HOT PICK', color: 'bg-red-500 text-white' },
            { text: 'LOW STOCK', color: 'bg-orange-500 text-white' },
            { text: '90% OFF', color: 'bg-pink-500 text-white' },
            null // Some cards have no top badge for variety
        ];
        // Deterministic based on ID
        return badges[product.id % badges.length];
    }, [product.id]);

    return (
        <div
            id={`product-card-${product.id}`}
            onClick={() => navigate(`/product/${product.id}`)}
            className="group block bg-white rounded-xl overflow-hidden cursor-pointer relative shadow-sm hover:shadow-xl hover:ring-2 hover:ring-primary transition-all duration-300"
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

                {/* Maximalist Loud Badge */}
                {randomBadge && (
                    <div className={`absolute top-0 left-0 z-20 px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter ${randomBadge.color} rounded-br-lg shadow-sm`}>
                        {randomBadge.text}
                    </div>
                )}

                {/* Fire Icon for "Hot" items */}
                {(product.id % 3 === 0) && (
                    <div className="absolute bottom-1 left-1 z-20 bg-black/60 backdrop-blur-md rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
                        <span className="text-xs">🔥</span>
                        <span className="text-[8px] font-bold text-white uppercase">Trending</span>
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
            </div>

            {/* Info Container - Maximalist Density */}
            <div className="p-2 flex flex-col gap-1.5 bg-gradient-to-b from-white to-gray-50/50">
                {/* Title */}
                <h3 className="text-gray-900 text-xs font-bold leading-tight line-clamp-2 min-h-[2.5em]">
                    {product.title}
                </h3>

                {/* Price Row - SUPER LOUD */}
                <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-red-600 font-black text-lg leading-none tracking-tight">
                        <span className="text-[10px] align-top relative top-0.5 mr-0.5">ETB</span>
                        {product.variations && product.variations.length > 0
                            ? Math.floor(Math.min(...product.variations.map(v => v.price)))
                            : Math.floor(product.price)
                        }
                    </span>
                    {(product.originalPrice > product.price || (product.variations && product.variations[0]?.originalPrice)) && (
                        <span className="text-gray-400 text-[9px] font-medium line-through decoration-red-400/50">
                            ETB {Math.floor(product.originalPrice || (product.variations ? Math.max(...product.variations.map(v => v.originalPrice || 0)) : 0))}
                        </span>
                    )}
                </div>

                {/* Badges Row - Visual Chaos */}
                <div className="flex flex-wrap items-center gap-1">
                    {discountPercentage > 0 && (
                        <span className="bg-red-100 text-red-700 border border-red-200 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">
                            -{discountPercentage}%
                        </span>
                    )}
                    <span className="bg-yellow-100 text-yellow-800 border border-yellow-200 text-[8px] font-bold px-1 py-0.5 rounded-sm uppercase">
                        Free Ship
                    </span>
                </div>

                {/* Sales Timer if active - Flashing */}
                {showFlashSale && (
                    <div className="animate-pulse">
                        <FlashSaleTimer className="scale-90 origin-left text-orange-600 font-bold" />
                    </div>
                )}

                {/* Social Proof & CTA */}
                <div className="flex items-center justify-between pt-1 border-t border-gray-100 mt-1">
                    <span className="text-[9px] text-gray-500 font-bold bg-gray-100 px-1.5 py-0.5 rounded-full">
                        {product.isUnique ? '100+ sold' : '5k+ sold'}
                    </span>

                    {/* Add To Cart Button - High Contrast */}
                    <button
                        onClick={handleAdd}
                        className={`p-1.5 rounded-full shadow-md active:scale-90 transition-all ${isAdded
                                ? 'bg-green-500 text-white ring-2 ring-green-200'
                                : 'bg-primary text-white hover:bg-orange-700 ring-2 ring-orange-100'
                            }`}
                        disabled={product.stock === 0 && !product.isUnique && (!product.variations || product.variations.length === 0)}
                    >
                        {isAdded ? <CheckCircle size={14} className="animate-bounce" /> : <ShoppingCart size={14} />}
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
