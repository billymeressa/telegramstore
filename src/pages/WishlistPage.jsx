import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';
import useStore from '../store/useStore';

const WishlistPage = ({ products }) => {
    const navigate = useNavigate();
    const { wishlist, toggleWishlist, addToCart } = useStore();
    const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

    return (
        <div className="min-h-screen bg-[#f5f5f5] pb-24 font-sans pt-[var(--tg-content-safe-area-top)]">
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center shadow-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="p-1 -ml-1 text-gray-700 active:opacity-60"
                >
                    <ArrowLeft size={22} />
                </button>
                <div className="flex-1 text-center pr-6">
                    <h1 className="text-lg font-bold text-black">My Wishlist</h1>
                </div>
            </div>

            {wishlistedProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center pt-24 px-6 text-center animate-in fade-in zoom-in duration-300">
                    <div className="bg-white p-6 rounded-full shadow-lg mb-6 relative">
                        <Heart size={48} className="text-gray-300" />
                        <div className="absolute top-0 right-0 bg-red-100 p-1.5 rounded-full">
                            <Heart size={16} className="text-red-500 fill-red-500" />
                        </div>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                    <p className="text-gray-500 text-sm mb-8 max-w-xs leading-relaxed">
                        Tap the heart icon on any product to save it here for later.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-[#fb7701] text-white px-10 py-3.5 rounded-full font-bold shadow-lg shadow-orange-500/20 active:scale-95 transition-transform flex items-center gap-2"
                    >
                        <ShoppingBag size={18} />
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div className="p-2 grid grid-cols-2 gap-2 animate-in slide-in-from-bottom-4 duration-500">
                    {wishlistedProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onAdd={() => addToCart(product)}
                            isWishlisted={true}
                            onToggleWishlist={() => toggleWishlist(product.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistPage;
