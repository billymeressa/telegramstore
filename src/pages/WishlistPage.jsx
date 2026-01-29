import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Heart, ArrowLeft } from 'lucide-react';
import useStore from '../store/useStore';


const WishlistPage = ({ products }) => {
    const navigate = useNavigate();

    // Zustand
    const wishlist = useStore(state => state.wishlist);
    const toggleWishlist = useStore(state => state.toggleWishlist);
    const addToCart = useStore(state => state.addToCart);

    const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

    return (
        <div className="min-h-dvh bg-[var(--tg-theme-secondary-bg-color)] pb-24 font-sans pt-[var(--tg-content-safe-area-top)]">
            {/* Header */}

            {wishlistedProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center pt-32 px-6 text-center">
                    <div className="bg-[var(--tg-theme-bg-color)] p-5 rounded-full mb-4">
                        <Heart size={40} className="text-[var(--tg-theme-hint-color)]/50" />
                    </div>
                    <h2 className="text-base font-semibold text-[var(--tg-theme-text-color)] mb-1">Your wishlist is empty</h2>
                    <p className="text-[var(--tg-theme-hint-color)] text-sm mb-6 max-w-xs">
                        Save items you want to buy later.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] px-6 py-2.5 rounded-xl font-medium active:opacity-80 transition-opacity"
                    >
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div className="mt-2 grid grid-cols-2 gap-4 p-4">
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
