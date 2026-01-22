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
        <div className="bg-white min-h-screen pb-20 relative">
            {/* Header / Nav */}
            <div className="bg-[#054D3B] p-3 flex items-center gap-3 sticky top-0 z-20 shadow-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="text-white p-1"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="flex-1" />
                <ShoppingBag size={24} className="text-white" />
            </div>

            {/* Product Title & Brand */}
            <div className="p-4 bg-white border-b border-gray-100">
                <div className="flex justify-between items-start">
                    <h1 className="text-xl font-normal text-[#0F1111] leading-snug line-clamp-3 mb-1">
                        {product.title}
                    </h1>
                </div>


            </div>

            {/* Image Area */}
            <div className="w-full bg-white relative">
                {/* Wishlist Button */}
                <button
                    onClick={() => {
                        if (toggleWishlist && product) toggleWishlist(product.id);
                    }}
                    className="absolute top-4 right-4 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-md z-10 hover:bg-white transition-all active:scale-95"
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
                    <div className="flex gap-3 overflow-x-auto p-4 no-scrollbar justify-center">
                        {product.images.map((img, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedImage(img)}
                                className={`w-16 h-16 border rounded-md flex items-center justify-center p-1 cursor-pointer flex-shrink-0 ${(selectedImage || product.images[0]) === img
                                    ? 'border-[#054D3B] ring-1 ring-[#054D3B] shadow-sm'
                                    : 'border-gray-200 hover:border-gray-400'
                                    }`}
                            >
                                <img src={img} className="max-w-full max-h-full object-contain" alt={`View ${idx + 1}`} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Price & Prime */}
            <div className="p-4 space-y-2 border-t border-gray-100 bg-white">
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-medium text-[#0F1111]">{Math.floor(product.price)}</span>
                    <span className="text-base align-top font-bold text-[#0F1111] mt-1">Birr</span>
                </div>
            </div>


            {/* Info */}
            <div className="p-4 space-y-4 bg-white border-t border-gray-200">
                <div>
                    <h3 className="text-lg font-bold text-[#0F1111] mb-1">About this item</h3>
                    <p className="text-[#0F1111] leading-relaxed text-base">
                        {product.description || "No description available."}
                    </p>
                </div>
            </div>

            {/* Smart Recommendations */}
            {relatedProducts.length > 0 && (
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <h3 className="text-lg font-bold text-[#0F1111] mb-3">You might also like</h3>
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                        {relatedProducts.map(rel => (
                            <div
                                key={rel.id}
                                onClick={() => {
                                    navigate(`/product/${rel.id}`);
                                    window.scrollTo(0, 0);
                                }}
                                className="min-w-[140px] w-[140px] bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm cursor-pointer flex-shrink-0"
                            >
                                <div className="w-full h-32 bg-white flex items-center justify-center">
                                    {rel.images?.[0] ? (
                                        <img src={rel.images[0]} alt={rel.title} className="max-w-full max-h-full object-contain" />
                                    ) : (
                                        <span className="text-2xl opacity-20 grayscale">📦</span>
                                    )}
                                </div>
                                <div className="p-2">
                                    <h4 className="text-xs font-medium text-[#0F1111] line-clamp-2 h-8 leading-tight mb-1">{rel.title}</h4>
                                    <p className="text-[#B12704] font-bold text-sm">{Math.floor(rel.price)} Birr</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Static Action Button */}
            <div className="p-4 bg-white border-t border-gray-200 mt-4">
                <div className="text-[#054D3B] font-bold text-lg mb-2 pl-1">
                    In Stock.
                </div>
                <button
                    onClick={() => {
                        onAdd({ ...product });
                    }}
                    className="w-full bg-[#D4AF37] text-[#111827] py-4 rounded-full font-bold text-lg shadow-sm border border-[#C5A028] active:bg-[#B59015]"
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

export default ProductDetails;
