import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

function ProductList({ products, wishlist = [], onToggleWishlist }) {
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-2 gap-2 p-2 pb-24">
            {products.map((product) => (
                <div
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="bg-[var(--tg-theme-bg-color)] rounded-xl overflow-hidden cursor-pointer active:scale-95 transition-all shadow-sm border border-[var(--tg-theme-section-separator-color)] hover:shadow-md"
                >
                    <div className="relative w-full aspect-[4/5] bg-[var(--tg-theme-secondary-bg-color)] flex items-center justify-center overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                            <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl opacity-20 grayscale">📦</span>
                        )}
                        {/* Wishlist Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onToggleWishlist) onToggleWishlist(product.id);
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur rounded-full active:scale-90 transition-all shadow-sm"
                        >
                            <Heart
                                size={16}
                                className={`transition-colors ${wishlist.includes(product.id) ? 'fill-[#ef4444] text-[#ef4444]' : 'text-gray-600'}`}
                            />
                        </button>
                    </div>

                    <div className="p-2.5 flex flex-col gap-1 text-left">
                        <h3 className="text-[var(--tg-theme-text-color)] text-base leading-tight line-clamp-2 min-h-[2.5em] font-bold">
                            {product.title}
                        </h3>
                        <div className="flex items-center justify-between mt-1">
                            <div className="flex items-baseline gap-0.5">
                                <span className="text-[var(--tg-theme-text-color)] text-lg font-extrabold">{Math.floor(product.price)}</span>
                                <span className="text-[var(--tg-theme-hint-color)] text-xs font-normal">ETB</span>
                            </div>

                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ProductList;
