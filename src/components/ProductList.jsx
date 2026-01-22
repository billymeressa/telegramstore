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
                    className="bg-[var(--tg-theme-bg-color)] rounded-xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
                >
                    <div className="relative w-full aspect-square bg-[var(--tg-theme-secondary-bg-color)] flex items-center justify-center overflow-hidden">
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
                            className="absolute top-1.5 right-1.5 p-1.5 bg-white/60 backdrop-blur-sm rounded-full active:bg-white transition-all"
                        >
                            <Heart
                                size={18}
                                className={`transition-colors ${wishlist.includes(product.id) ? 'fill-[#ef4444] text-[#ef4444]' : 'text-gray-500'}`}
                            />
                        </button>
                    </div>

                    <div className="p-2 flex flex-col gap-0.5">
                        <div className="flex items-baseline gap-1">
                            <span className="text-[var(--tg-theme-text-color)] text-sm font-semibold">{Math.floor(product.price)}</span>
                            <span className="text-[var(--tg-theme-hint-color)] text-xs">Birr</span>
                        </div>
                        <h3 className="text-[var(--tg-theme-text-color)] text-xs leading-snug line-clamp-2 h-8 overflow-hidden font-normal opacity-90">
                            {product.title}
                        </h3>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ProductList;
