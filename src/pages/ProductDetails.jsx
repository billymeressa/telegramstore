import { useState, useEffect } from 'react';
import API_URL from '../config';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Heart } from 'lucide-react';

const ProductDetails = ({ onAdd, wishlist = [], toggleWishlist, products = [] }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [selectedImage, setSelectedImage] = useState(null);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    // Smart Recommendations Logic
    const relatedProducts = product ? products
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 6) : [];

    useEffect(() => {
        console.log("Fetching details for Product ID:", id);
        fetch(`${API_URL}/api/products/${id}`)
            .then(res => {
                if (!res.ok) {
                    return res.text().then(text => { throw new Error(`HTTP ${res.status}: ${text}`) });
                }
                return res.json();
            })
            .then(data => {
                console.log("Product Data Loaded:", data);
                setProduct(data);
            })
            .catch(err => {
                console.error("Fetch Error:", err);
                alert(`Error loading product: ${err.message}`);
                // navigate('/'); // Don't redirect, lets see the error
            })
            .finally(() => setLoading(false));
    }, [id, navigate]);

    if (loading || !product) return <div className="p-10 text-center">Loading...</div>;



    return (
        <div className="bg-[var(--tg-theme-bg-color)] min-h-screen pb-24 relative font-sans">
            {/* Header / Nav */}
            <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between p-2 pointer-events-none">
                <button
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 flex items-center justify-center bg-[var(--tg-theme-bg-color)] rounded-full shadow-sm text-[var(--tg-theme-text-color)] pointer-events-auto"
                >
                    <ArrowLeft size={20} />
                </button>
            </div>

            {/* Product Title & Brand */}
            {/* Removed separate title block, moved below image */}

            {/* Product Title & Brand */}
            {/* Image Area */}
            <div className="w-full bg-[var(--tg-theme-secondary-bg-color)] relative pt-safe">
                {/* Wishlist Button */}
                <button
                    onClick={() => {
                        if (toggleWishlist && product) toggleWishlist(product.id);
                    }}
                    className="absolute top-4 right-4 p-3 bg-[var(--tg-theme-bg-color)] rounded-full shadow-md z-10 hover:bg-[var(--tg-theme-secondary-bg-color)] transition-all active:scale-95"
                >
                    <Heart
                        size={24}
                        className={`transition-colors ${wishlist.includes(product?.id) ? 'fill-[#ef4444] text-[#ef4444]' : 'text-gray-400'}`}
                    />
                </button>
                {/* Main Image */}
                <div className="w-full flex items-center justify-center bg-white">
                    {product.images && product.images.length > 0 ? (
                        <img
                            src={selectedImage || product.images[0]}
                            alt={product.title}
                            className="w-full h-auto object-contain transition-opacity duration-300"
                        />
                    ) : (
                        <span className="text-9xl select-none opacity-20 grayscale py-10">📦</span>
                    )}
                </div>

                {/* Thumbnails */}
                {product.images && product.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto p-4 no-scrollbar justify-center">
                        {product.images.map((img, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedImage(img)}
                                className={`w-14 h-14 rounded-lg flex items-center justify-center p-0.5 cursor-pointer flex-shrink-0 transition-all ${(selectedImage || product.images[0]) === img
                                    ? 'border-2 border-[var(--tg-theme-button-color)]'
                                    : 'border border-transparent opacity-70'
                                    }`}
                            >
                                <img src={img} className="max-w-full max-h-full object-contain rounded" alt={`View ${idx + 1}`} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Content Container */}
            <div className="px-4 py-5 bg-[var(--tg-theme-bg-color)] rounded-t-3xl -mt-6 relative z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">

                {/* Title & Price */}
                <div className="mb-4">
                    <h1 className="text-xl font-semibold text-[var(--tg-theme-text-color)] leading-snug mb-2">
                        {product.title}
                    </h1>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-[var(--tg-theme-text-color)]">{Math.floor(product.price)}</span>
                        <span className="text-sm font-medium text-[var(--tg-theme-hint-color)]">Birr</span>
                    </div>
                </div>

                {/* Info */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-[var(--tg-theme-hint-color)] uppercase tracking-wide mb-1.5">Description</h3>
                        <p className="text-[var(--tg-theme-text-color)] leading-relaxed text-sm opacity-90">
                            {product.description || "No description available."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Smart Recommendations */}
            {relatedProducts.length > 0 && (
                <div className="p-4 bg-[var(--tg-theme-secondary-bg-color)] mt-4">
                    <h3 className="text-sm font-semibold text-[var(--tg-theme-hint-color)] uppercase tracking-wide mb-3">You might also like</h3>
                    <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2">
                        {relatedProducts.map(rel => (
                            <div
                                key={rel.id}
                                onClick={() => {
                                    navigate(`/product/${rel.id}`);
                                    window.scrollTo(0, 0);
                                }}
                                className="min-w-[120px] w-[120px] bg-[var(--tg-theme-bg-color)] rounded-xl overflow-hidden shadow-sm cursor-pointer flex-shrink-0 active:scale-95 transition-transform"
                            >
                                <div className="w-full h-28 bg-[var(--tg-theme-secondary-bg-color)] flex items-center justify-center">
                                    {rel.images?.[0] ? (
                                        <img src={rel.images[0]} alt={rel.title} className="max-w-full max-h-full object-contain" />
                                    ) : (
                                        <span className="text-2xl opacity-20 grayscale">📦</span>
                                    )}
                                </div>
                                <div className="p-2">
                                    <h4 className="text-[11px] font-medium text-[var(--tg-theme-text-color)] line-clamp-2 h-7 leading-tight mb-0.5">{rel.title}</h4>
                                    <p className="text-[var(--tg-theme-button-color)] font-bold text-xs">{Math.floor(rel.price)} Birr</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Static Action Button */}
            <div className="fixed bottom-0 left-0 right-0 p-3 bg-[var(--tg-theme-bg-color)] border-t border-[var(--tg-theme-section-separator-color)] z-30 pb-safe">
                <button
                    onClick={() => {
                        onAdd({ ...product });
                    }}
                    className="w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] py-3 rounded-xl font-semibold text-base shadow active:opacity-80 transition-opacity"
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

export default ProductDetails;
