import { useOutletContext, useNavigate } from 'react-router-dom';
import ProductList from '../components/ProductList';
import { Heart } from 'lucide-react';

const WishlistPage = ({ products, wishlist, toggleWishlist }) => {
    const navigate = useNavigate();

    const wishlistProducts = products.filter(p => wishlist.includes(p.id));

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white p-4 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <h1 className="text-xl font-bold text-[#111827] flex items-center gap-2">
                    <Heart className="text-[#D4AF37] fill-[#D4AF37]" size={24} />
                    My Wishlist
                </h1>
                <p className="text-sm text-gray-500">{wishlistProducts.length} items saved</p>
            </div>

            {wishlistProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center pt-20 px-6 text-center">
                    <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                        <Heart size={48} className="text-gray-300" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
                    <p className="text-gray-500 mb-6 max-w-xs">
                        Tap the heart icon on any product to save it here for later.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-[#054D3B] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#043d2e] transition-colors"
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
