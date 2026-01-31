import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import useStore from '../store/useStore';

function ProductCard({ product, onAdd }) {
    const navigate = useNavigate();
    const [isAdded, setIsAdded] = useState(false);
    const settings = useStore(state => state.settings);

    // Flash Sale Logic (Mocked randomness for "Temu" feel)
    const isFlashSale = useMemo(() => {
        // Simple hash to consistently show sale on same products
        const hash = product.id % 3 === 0;
        return product.isFlashSale || hash;
    }, [product.id]);

    const soldPercentage = useMemo(() => {
        // Random "sold" percentage between 60% and 95% for urgency
        return 60 + (product.id % 35);
    }, [product.id]);

    const discount = useMemo(() => {
        if (product.originalPrice > product.price) {
            return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        }
        return isFlashSale ? 50 + (product.id % 40) : 0; // Fake discount if needed for visual
    }, [product]);

    const handleAdd = (e) => {
        e.stopPropagation();
        onAdd(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 1000);
    };

    const formattedPrice = product.variations && product.variations.length > 0
        ? Math.min(...product.variations.map(v => v.price))
        : product.price;

    return (
        <div
            onClick={() => navigate(`/product/${product.id}`)}
            className="group flex flex-col bg-white rounded-lg overflow-hidden border border-gray-100 hover:shadow-lg hover:border-[#fb7701]/30 transition-all duration-300 relative active:scale-[0.98]"
        >
            {/* Image */}
            <div className="relative aspect-square bg-gray-100">
                {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Img</div>
                )}

                {/* Dynamic Shimmer Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-150%] group-hover:animate-shimmer" />

                {/* Flash Deal Badge */}
                {isFlashSale && (
                    <div className="absolute left-0 bottom-0 bg-[#fb7701] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-tr-lg animate-pulse-fast">
                        ⚡ Lightning Deal
                    </div>
                )}

                {/* Almost Sold Out Badge (Random) */}
                {product.stock < 10 && (
                    <div className="absolute top-0 right-0 bg-[#be0000]/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-bl-lg shadow-sm">
                        Almost Sold Out
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-2 flex-col flex-1 flex justify-between relative">
                <div>
                    <h3 className="text-xs text-[#191919] line-clamp-2 leading-tight mb-1 font-normal h-[2.5em]">
                        {product.title}
                    </h3>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-1.5">
                        <span className="text-[9px] text-[#fb7701] bg-[#fff0e0] border border-[#fb7701]/20 px-1 rounded-sm">
                            Free shipping
                        </span>
                        {discount > 0 && (
                            <span className="text-[9px] text-[#be0000] border border-[#be0000]/20 px-1 rounded-sm">
                                -{discount}%
                            </span>
                        )}
                    </div>
                </div>

                <div className="mt-1">
                    {/* Price Block */}
                    <div className="flex items-baseline gap-1">
                        <span className="text-[10px] text-[#fb7701] font-bold">ETB</span>
                        <span className="text-lg font-bold text-[#fb7701] leading-none">
                            {Math.floor(formattedPrice)}
                        </span>
                    </div>
                    {/* Original Price */}
                    <div className="text-[10px] text-gray-400 line-through leading-tight">
                        ETB {Math.floor(formattedPrice * (1 + (discount || 20) / 100))}
                    </div>

                    {/* Sold Count */}
                    <div className="text-[10px] text-gray-500 mt-0.5">
                        {product.isUnique ? '10 sold' : '5k+ sold'}
                    </div>

                    {/* Stock Progress Bar */}
                    <div className="mt-1.5 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#fb7701] to-[#ff9900] rounded-full relative"
                            style={{ width: `${soldPercentage}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_1s_infinite_linear]" />
                        </div>
                    </div>
                    <div className="text-[9px] text-[#fb7701] mt-0.5 font-medium">
                        Almost sold out!
                    </div>
                </div>

                {/* Cart Button Overlay */}
                <button
                    onClick={handleAdd}
                    className={`absolute bottom-2 right-2 w-7 h-7 rounded-full flex items-center justify-center border transition-all ${isAdded ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-[#fb7701] hover:border-[#fb7701]'}`}
                >
                    <ShoppingCart size={14} />
                </button>
            </div>
        </div>
    );
}

// Memoize to optimize grid rendering
export default React.memo(ProductCard);
