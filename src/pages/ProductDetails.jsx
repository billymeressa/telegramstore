import { useState, useEffect, useMemo } from 'react';
import API_URL from '../config';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Share2, ChevronRight, ShieldCheck, Zap, Star, AlertCircle } from 'lucide-react';
import useStore from '../store/useStore';
import ProductList from '../components/ProductList';
import { smartSort } from '../utils/smartSort';

const ProductDetails = ({ onBuyNow, products = [], isAdmin = false }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, wishlist, toggleWishlist } = useStore();

    // State
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedVariation, setSelectedVariation] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [showFullDesc, setShowFullDesc] = useState(false);

    // Countdown Timer Logic (Fake for demo urgency)
    const [timeLeft, setTimeLeft] = useState({ h: 11, m: 59, s: 59 });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                let { h, m, s } = prev;
                if (s > 0) s--;
                else {
                    s = 59;
                    if (m > 0) m--;
                    else {
                        m = 59;
                        if (h > 0) h--;
                        else h = 23; // Loop
                    }
                }
                return { h, m, s };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch Product
    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError(null);

        console.log(`Fetching product: ${API_URL}/api/products/${id}`);

        fetch(`${API_URL}/api/products/${id}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP Error: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (!data || data.error) {
                    throw new Error(data?.error || "Product data is empty");
                }
                setProduct(data);
                if (data.variations?.length > 0) setSelectedVariation(data.variations[0]);
            })
            .catch(err => {
                console.error("Fetch Error:", err);
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }, [id]);

    // Related Products
    const relatedProducts = useMemo(() => {
        if (!product) return [];
        return smartSort(products.filter(p => p.category === product.category && p.id !== product.id)).slice(0, 6);
    }, [product, products]);

    const handleAddToCart = () => {
        if (!product) return;
        const itemToAdd = {
            ...product,
            selectedVariation: selectedVariation || {},
            price: selectedVariation ? selectedVariation.price : product.price
        };
        addToCart(itemToAdd);
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
        alert("Added to Cart!"); // Replace with toast later
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#f5f5f5]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#fb7701] mb-4"></div>
            <p className="text-gray-500 text-xs">Loading product...</p>
        </div>
    );

    if (error || !product) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#f5f5f5] p-6 text-center">
            <div className="bg-red-100 p-4 rounded-full mb-4">
                <AlertCircle size={32} className="text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Product Not Found</h2>
            <p className="text-sm text-gray-500 mb-6">{error || "We couldn't find the product you're looking for."}</p>
            <button
                onClick={() => navigate('/')}
                className="bg-[#fb7701] text-white px-6 py-2 rounded-full font-bold text-sm shadow-md"
            >
                Back to Store
            </button>
        </div>
    );

    const currentPrice = selectedVariation ? selectedVariation.price : product.price;
    const originalPrice = product.originalPrice || currentPrice * 1.4;

    return (
        <div className="bg-[#f5f5f5] min-h-screen pb-[80px]">
            {/* Header Navigation */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-3 py-2 bg-transparent pointer-events-none">
                <button
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm pointer-events-auto active:scale-90 transition-transform"
                >
                    <ArrowLeft size={18} />
                </button>
                <button
                    onClick={() => navigate('/cart')}
                    className="w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm pointer-events-auto active:scale-90 transition-transform"
                >
                    <ShoppingCart size={18} />
                </button>
            </div>

            {/* Image Gallery */}
            <div className="relative w-full aspect-square bg-gray-200">
                <img
                    src={product.images?.[activeImageIndex] || product.images?.[0] || 'https://via.placeholder.com/400'}
                    alt={product.title}
                    className="w-full h-full object-cover"
                />

                {/* Image Counter */}
                <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {activeImageIndex + 1}/{product.images?.length || 1}
                </div>
            </div>

            {/* Flash Sale Bar */}
            <div className="bg-gradient-to-r from-[#be0000] to-[#ff4500] text-white px-3 py-2 flex items-center justify-between">
                <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold">ETB {Math.floor(currentPrice)}</span>
                    <span className="text-xs line-through opacity-80">ETB {Math.floor(originalPrice)}</span>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-yellow-300">
                        <Zap size={10} fill="currentColor" /> Flash Sale
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-mono">
                        Ends in <span className="bg-white text-[#be0000] px-0.5 rounded text-[10px]">{timeLeft.h}</span>:
                        <span className="bg-white text-[#be0000] px-0.5 rounded text-[10px]">{timeLeft.m}</span>:
                        <span className="bg-white text-[#be0000] px-0.5 rounded text-[10px]">{timeLeft.s}</span>
                    </div>
                </div>
            </div>

            {/* Titling & Urgency */}
            <div className="bg-white px-3 py-3 mb-2">
                <h1 className="text-sm text-[#191919] leading-snug mb-2 font-normal">
                    {product.title}
                </h1>

                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <div className="flex text-[#fb7701]">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} fill="currentColor" />)}
                        </div>
                        <span>4.9 (2.1k sold)</span>
                    </div>
                    <button onClick={() => toggleWishlist(product.id)}>
                        <Heart size={20} className={wishlist.includes(product.id) ? "fill-[#be0000] text-[#be0000]" : "text-gray-400"} />
                    </button>
                </div>

                {/* Urgency Message */}
                {product.stock < 20 && (
                    <div className="flex items-center gap-1 text-[#be0000] text-[10px] font-medium bg-[#fff0e0] px-2 py-1 rounded inline-block">
                        <div className="animate-pulse"><Zap size={10} fill="currentColor" /></div>
                        Almost sold out! Only {product.stock} items left
                    </div>
                )}
            </div>

            {/* Variations */}
            {product.variations?.length > 0 && (
                <div className="bg-white px-3 py-3 mb-2">
                    <h3 className="text-[12px] font-bold mb-2">Select {product.variationType || 'Option'}</h3>
                    <div className="flex flex-wrap gap-2">
                        {product.variations.map((v, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedVariation(v)}
                                className={`px-3 py-1.5 rounded-full text-[11px] border ${selectedVariation === v
                                        ? 'border-[#fb7701] text-[#fb7701] bg-[#fff0e0]'
                                        : 'border-gray-200 text-gray-600'
                                    }`}
                            >
                                {v.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Value Props / Shipping */}
            <div className="bg-white px-3 py-3 mb-2 space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-[#191919]">
                    <span className="font-bold text-[#fb7701]">Free Shipping</span>
                    <span className="text-gray-400">on all orders today</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#191919]">
                    <ShieldCheck size={14} className="text-green-600" />
                    <span>Free Returns within 90 days</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#191919]">
                    <ShieldCheck size={14} className="text-green-600" />
                    <span>Price adjustment</span>
                </div>
            </div>

            {/* Description */}
            <div className="bg-white px-3 py-3 mb-2">
                <h3 className="text-[12px] font-bold mb-1">Item Description</h3>
                <p className={`text-[11px] text-gray-600 leading-relaxed ${!showFullDesc && 'line-clamp-3'}`}>
                    {product.description}
                </p>
                {product.description?.length > 100 && (
                    <button
                        onClick={() => setShowFullDesc(!showFullDesc)}
                        className="text-[11px] text-blue-500 mt-1 flex items-center font-medium"
                    >
                        {showFullDesc ? 'See Less' : 'See More'} <ChevronRight size={12} className={showFullDesc ? "rotate-90" : ""} />
                    </button>
                )}
            </div>

            {/* Recommended */}
            {relatedProducts.length > 0 && (
                <div className="bg-white px-3 py-3">
                    <h3 className="text-[12px] font-bold mb-2">You May Also Like</h3>
                    <ProductList products={relatedProducts} />
                </div>
            )}

            {/* Sticky Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-3 py-2 flex items-center gap-2 pb-[calc(10px+var(--tg-safe-area-bottom))] z-50">
                <button className="flex-col items-center justify-center px-2 hidden sm:flex">
                    <Share2 size={18} />
                    <span className="text-[9px]">Share</span>
                </button>

                <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-[#fb7701] text-white font-bold text-sm py-2.5 rounded-full active:scale-95 transition-transform"
                >
                    Add to Cart
                </button>
                <button
                    className="flex-1 bg-[#be0000] text-white font-bold text-sm py-2.5 rounded-full active:scale-95 transition-transform"
                >
                    Buy Now
                </button>
            </div>
        </div>
    );
};

export default ProductDetails;
