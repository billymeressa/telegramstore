import { useState, useEffect } from 'react';
import API_URL from '../config';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Heart } from 'lucide-react';
import { trackEvent } from '../utils/track';

const ProductDetails = ({ onAdd, wishlist = [], toggleWishlist, products = [] }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [selectedImage, setSelectedImage] = useState(null);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariation, setSelectedVariation] = useState(null);

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

                // Auto-select first variation if product has variations
                if (data.variations && data.variations.length > 0) {
                    setSelectedVariation(data.variations[0]);
                }

                // Track product view
                trackEvent('view_product', { productId: data.id, productTitle: data.title, category: data.category });
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
        <div className="bg-[var(--tg-theme-bg-color)] min-h-screen relative font-sans">
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

                {/* Swipeable Image Carousel */}
                <div className="relative w-full bg-white overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                        <>
                            {/* Image Container */}
                            <div
                                className="flex transition-transform duration-300 ease-out"
                                style={{
                                    transform: `translateX(-${(product.images.indexOf(selectedImage || product.images[0])) * 100}%)`
                                }}
                                onTouchStart={(e) => {
                                    const touch = e.touches[0];
                                    e.currentTarget.dataset.startX = touch.clientX;
                                }}
                                onTouchEnd={(e) => {
                                    const touch = e.changedTouches[0];
                                    const startX = parseFloat(e.currentTarget.dataset.startX);
                                    const diff = touch.clientX - startX;
                                    const currentIndex = product.images.indexOf(selectedImage || product.images[0]);

                                    // Swipe threshold: 50px
                                    if (diff > 50 && currentIndex > 0) {
                                        // Swipe right - go to previous image
                                        setSelectedImage(product.images[currentIndex - 1]);
                                    } else if (diff < -50 && currentIndex < product.images.length - 1) {
                                        // Swipe left - go to next image
                                        setSelectedImage(product.images[currentIndex + 1]);
                                    }
                                }}
                            >
                                {product.images.map((img, idx) => (
                                    <div key={idx} className="w-full flex-shrink-0 flex items-center justify-center">
                                        <img
                                            src={img}
                                            alt={`${product.title} - Image ${idx + 1}`}
                                            className="w-full h-auto object-contain"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Dots */}
                            {product.images.length > 1 && (
                                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                                    {product.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(img)}
                                            className={`w-2 h-2 rounded-full transition-all ${(selectedImage || product.images[0]) === img
                                                    ? 'bg-[var(--tg-theme-button-color)] w-6'
                                                    : 'bg-gray-300'
                                                }`}
                                            aria-label={`View image ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-full flex items-center justify-center py-10">
                            <span className="text-9xl select-none opacity-20 grayscale">📦</span>
                        </div>
                    )}
                </div>

                {/* Thumbnails - Keep for additional navigation option */}
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
                    <h1 className="text-2xl font-bold text-[var(--tg-theme-text-color)] leading-snug mb-2">
                        {product.title}
                    </h1>

                    {/* Variation Selector */}
                    {product.variations && product.variations.length > 0 && (
                        <div className="mb-3">
                            <h3 className="text-xs font-medium text-[var(--tg-theme-hint-color)] uppercase tracking-wide mb-2">
                                Select Option
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {product.variations.map((variation, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedVariation(variation)}
                                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${selectedVariation?.name === variation.name
                                            ? 'bg-[var(--tg-theme-button-color)] text-white shadow-md'
                                            : 'bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-text-color)] border border-gray-300'
                                            }`}
                                    >
                                        {variation.name} - {Math.floor(variation.price)} Birr
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-[var(--tg-theme-text-color)]">
                            {selectedVariation ? Math.floor(selectedVariation.price) : Math.floor(product.price)}
                        </span>
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

                {/* Call & Add to Cart Action */}
                <div className="flex gap-3 mt-6 mb-2">
                    {product.seller_phone && (
                        <a
                            href={`tel:${product.seller_phone}`}
                            className="flex-1 bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-text-color)] py-3 rounded-xl font-semibold text-base shadow border border-[var(--tg-theme-button-color)] flex items-center justify-center active:opacity-80 transition-opacity"
                        >
                            Call Merchant
                        </a>
                    )}
                    <button
                        onClick={() => {
                            onAdd({ ...product, selectedVariation });
                        }}
                        className="flex-[2] bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] py-3 rounded-xl font-semibold text-base shadow active:opacity-80 transition-opacity"
                    >
                        Add to Cart
                    </button>
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
                                className="min-w-[160px] w-[160px] bg-[var(--tg-theme-bg-color)] rounded-xl overflow-hidden shadow-sm cursor-pointer flex-shrink-0 active:scale-95 transition-transform"
                            >
                                <div className="w-full h-40 bg-[var(--tg-theme-secondary-bg-color)] flex items-center justify-center">
                                    {rel.images?.[0] ? (
                                        <img src={rel.images[0]} alt={rel.title} className="max-w-full max-h-full object-contain" />
                                    ) : (
                                        <span className="text-4xl opacity-20 grayscale">📦</span>
                                    )}
                                </div>
                                <div className="p-3">
                                    <h4 className="text-sm font-bold text-[var(--tg-theme-text-color)] line-clamp-2 h-10 leading-snug mb-1">{rel.title}</h4>
                                    <p className="text-[var(--tg-theme-button-color)] font-bold text-base">{Math.floor(rel.price)} Birr</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}


        </div>
    );
};

export default ProductDetails;
