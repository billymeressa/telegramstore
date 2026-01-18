import { useState, useEffect } from 'react';
import API_URL from '../config';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

const ProductDetails = ({ onAdd }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [selectedImage, setSelectedImage] = useState(null);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

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
                    <h1 className="text-base font-normal text-[#0F1111] leading-snug line-clamp-3 mb-1">
                        {product.title}
                    </h1>
                </div>


            </div>

            {/* Image Area */}
            <div className="w-full bg-white p-4">
                {/* Main Image */}
                <div className="w-full aspect-square flex items-center justify-center mb-4">
                    {product.images && product.images.length > 0 ? (
                        <img
                            src={selectedImage || product.images[0]}
                            alt={product.title}
                            className="max-h-full max-w-full object-contain transition-opacity duration-300"
                        />
                    ) : (
                        <span className="text-9xl select-none opacity-20 grayscale">📦</span>
                    )}
                </div>

                {/* Thumbnails */}
                {product.images && product.images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar justify-center">
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
                    <span className="text-3xl font-medium text-[#0F1111]">{Math.floor(product.price)}</span>
                    <span className="text-sm align-top font-bold text-[#0F1111] mt-1">Birr</span>
                </div>
            </div>


            {/* Info */}
            <div className="p-4 space-y-4 bg-white border-t border-gray-200">
                <div>
                    <h3 className="text-base font-bold text-[#0F1111] mb-1">About this item</h3>
                    <p className="text-[#0F1111] leading-relaxed text-sm">
                        {product.description || "No description available."}
                    </p>
                </div>
            </div>

            {/* Sticky Action Button */}
            <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-200 z-[60] shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
                <div className="text-[#054D3B] font-bold text-lg mb-2 pl-1">
                    In Stock.
                </div>
                <button
                    onClick={() => {
                        onAdd({ ...product });
                    }}
                    className="w-full bg-[#D4AF37] text-[#111827] py-3 rounded-full font-bold text-base shadow-sm border border-[#C5A028] active:bg-[#B59015]"
                >
                    Add to Cart
                </button>

            </div>
        </div>
    );
};

export default ProductDetails;
