import { useOutletContext, useNavigate } from 'react-router-dom';
import ProductList from '../components/ProductList';
import { Heart } from 'lucide-react';

const WishlistPage = ({ products, wishlist, toggleWishlist }) => {
    const navigate = useNavigate();

    const wishlistProducts = products.filter(p => wishlist.includes(p.id));

    return (
        <div className="min-h-screen bg-[var(--tg-theme-secondary-bg-color)] pb-24 font-sans">
            {/* Header */}
            <div className="bg-[var(--tg-theme-bg-color)] p-4 border-b border-[var(--tg-theme-section-separator-color)] sticky top-0 z-10">
                <h1 className="text-lg font-bold text-[var(--tg-theme-text-color)] flex items-center gap-2">
                    <Heart className="text-red-500 fill-red-500" size={20} />
                    My Wishlist
                </h1>
                <p className="text-xs text-[var(--tg-theme-hint-color)] mt-0.5">{wishlistProducts.length} items saved</p>
            </div>

            {wishlistProducts.length === 0 ? (
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
                <div className="mt-2">
                    <ProductList
                        products={wishlistProducts}
                        wishlist={wishlist}
                        onToggleWishlist={toggleWishlist}
                    />
                </div>
            )}
        </div>
    );
};

export default WishlistPage;
