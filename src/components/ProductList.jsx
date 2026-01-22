import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

function ProductList({ products, wishlist = [], onToggleWishlist }) {
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-2 gap-3 p-3 pb-24 bg-[#F3F4F6]">
            {products.map((product) => (
                <div
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="bg-white rounded-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                >
                    <div className="relative w-full aspect-[4/5] bg-gray-100 flex items-center justify-center overflow-hidden">
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
                            className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all active:scale-95"
                        >
                            <Heart
                                size={18}
                                className={`transition-colors ${wishlist.includes(product.id) ? 'fill-[#ef4444] text-[#ef4444]' : 'text-gray-400'}`}
                            />
                        </button>
                    </div>

                    <div className="p-3 flex flex-col gap-1">
                        <h3 className="text-[#0F1111] text-base leading-snug line-clamp-2 h-12 overflow-hidden font-normal">
                            {product.title}
                        </h3>

                        <div className="flex items-baseline gap-1 mt-1">

                            <span className="text-[#0F1111] text-2xl font-medium leading-none">{Math.floor(product.price)}</span>

                            <span className="text-[#0F1111] text-sm font-bold ml-1">Birr</span>
                        </div>



                        {/* Fake Prime Badge or similar */}

                    </div>
                </div>
            ))}
        </div>
    );
}

export default ProductList;
