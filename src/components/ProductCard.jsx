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
            {/* Image & Overlays */}
            <div className="relative aspect-square bg-gray-100">
                {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Img</div>
                )}

                {/* Overlays */}
                <div className="absolute inset-0 p-1 flex flex-col justify-between pointer-events-none">
                    <div className="flex justify-between items-start">
                        {/* Top Left: Flash Sale / Discount Badge */}
                        {(isFlashSale || discount > 0) && (
                            <span className="bg-[#be0000] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm backdrop-blur-sm">
                                {isFlashSale ? '⚡ FLASH' : `-${discount}%`}
                            </span>
                        )}
                    </div>

                    {/* Bottom: Stock Warning or Special Tag */}
                    {(product.stock < 10) && (
                        <span className="self-start bg-black/60 text-white text-[8px] px-1 rounded-sm backdrop-blur-md">
                            Only {product.stock} left
                        </span>
                    )}
                </div>

                {/* Dynamic Shimmer Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-150%]" />
            </div>

            {/* Dense Content */}
            <div className="p-1.5 flex flex-col gap-1">
                {/* Title */}
                <h3 className="text-xs text-[#191919] line-clamp-2 leading-tight font-normal min-h-[0] mb-0.5">
                    {product.title}
                </h3>

                {/* Price Row */}
                <div className="flex items-baseline gap-1.5 flex-wrap">
                    <div className="flex items-baseline gap-0.5">
                        <span className="text-[10px] text-[#fb7701] font-bold">ETB</span>
                        <span className="text-base font-bold text-[#fb7701] leading-none">
                            {Math.floor(formattedPrice)}
                        </span>
                    </div>
                    {discount > 0 && (
                        <span className="text-[9px] text-gray-400 line-through">
                            {Math.floor(formattedPrice * (1 + discount / 100))}
                        </span>
                    )}
                </div>

                {/* Footer Row: Sold & Shipping & Cart */}
                <div className="flex items-center justify-between mt-auto pt-0.5 border-t border-dashed border-gray-100/50">
                    <div className="flex items-center gap-1.5 text-[9px] text-gray-500">
                        <span>{product.isUnique ? '10 sold' : '5k+ sold'}</span>
                        {/* Dot separator */}
                        {/* <span className="w-0.5 h-0.5 bg-gray-300 rounded-full"></span> */}
                        {/* <span className="text-[#fb7701]">Free Ship</span> */}
                    </div>

                    <button
                        onClick={handleAdd}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isAdded ? 'bg-green-500 text-white' : 'text-[#fb7701] bg-orange-50 hover:bg-[#fb7701] hover:text-white'}`}
                    >
                        <ShoppingCart size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Memoize to optimize grid rendering
export default React.memo(ProductCard);
