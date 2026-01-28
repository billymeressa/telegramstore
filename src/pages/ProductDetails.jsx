import { useState, useEffect, useRef } from 'react';
import API_URL from '../config';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Heart, Edit2, Check, Zap } from 'lucide-react';

import { trackEvent } from '../utils/track';
import ProductList from '../components/ProductList';

const SUBCATEGORIES = {
    'Men': ['Shirts', 'T-Shirts', 'Pants', 'Jeans', 'Shoes', 'Suits', 'Accessories', 'Activewear', 'Other'],
    'Women': ['Dresses', 'Tops', 'Skirts', 'Pants', 'Jeans', 'Shoes', 'Bags', 'Jewelry', 'Accessories', 'Other'],
    'Kids': ['Boys Clothing', 'Girls Clothing', 'Baby', 'Shoes', 'Toys', 'School', 'Other'],
    'Electronics': ['Phones', 'Laptops', 'Audio', 'Storage', 'Computer Accessories', 'Gaming', 'Networking', 'Smart Home', 'Other'],
    'Home': ['Decor', 'Kitchen', 'Bedding', 'Furniture', 'Lighting', 'Tools', 'Other'],
    'Beauty': ['Skincare', 'Makeup', 'Fragrance', 'Haircare', 'Personal Care', 'Other'],
    'Sports': ['Gym Equipment', 'Team Sports', 'Outdoor', 'Running', 'Nutrition', 'Other'],
    'Books': ['Fiction', 'Non-Fiction', 'Educational', 'Self-Help', 'Children', 'Other'],
    'Vehicles': ['Cars', 'Motorcycles', 'Bicycles', 'Parts & Accessories', 'Tires & Wheels', 'Car Electronics', 'Tools & Equipment', 'Other']
};


const ProductDetails = ({ onAdd, onBuyNow, wishlist = [], toggleWishlist, products = [], isAdmin = false, sellerUsername }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [selectedImage, setSelectedImage] = useState(null);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariation, setSelectedVariation] = useState(null);
    const [isAdded, setIsAdded] = useState(false);


    // Edit mode states
    const [isEditMode, setIsEditMode] = useState(false);
    const [editFormData, setEditFormData] = useState({
        title: '',
        price: '',
        description: '',
        category: '',
        department: '',
        stock: '',
        isUnique: false,
        stockStatus: '',
        variations: [],
        variationType: '',
        existingImages: [],  // URLs of existing images
        newImages: []        // File objects for new uploads
    });
    const [isSaving, setIsSaving] = useState(false);

    // Categories to demote (push to bottom)
    const GENERIC_CATEGORIES = ['Parts & Accessories', 'Tools', 'Tools & Equipment', 'Other', 'Computer Accessories', 'Cables', 'Adapters'];

    // Smart Sort Algorithm
    const smartSort = (items) => {
        if (!items || items.length === 0) return [];
        const premium = items.filter(p => !GENERIC_CATEGORIES.includes(p.category || 'Other'));
        const generic = items.filter(p => GENERIC_CATEGORIES.includes(p.category || 'Other'));

        // Fisher-Yates Shuffle for premium items
        const shuffledPremium = [...premium];
        for (let i = shuffledPremium.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledPremium[i], shuffledPremium[j]] = [shuffledPremium[j], shuffledPremium[i]];
        }
        return [...shuffledPremium, ...generic];
    };

    // Smart Recommendations Logic (Filtered & Sorted)
    const relatedProducts = product ? smartSort(products
        .filter(p => p.category === product.category && p.id !== product.id))
        .slice(0, 10) : [];

    // Sticky Header Logic
    const [showStickyHeader, setShowStickyHeader] = useState(false);
    const recommendedRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (recommendedRef.current) {
                const rect = recommendedRef.current.getBoundingClientRect();
                // Show header when halfway through to the recommendation section 
                setShowStickyHeader(rect.top <= 120);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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



    // Handle entering edit mode
    const handleEditClick = () => {
        setEditFormData({
            title: product.title || '',
            price: product.price || '',
            description: product.description || '',
            category: product.category || '',
            department: product.department || '',
            stock: product.stock || '',
            isUnique: product.isUnique || false,
            stockStatus: product.stockStatus || '',
            variations: product.variations || [],
            variationType: product.variations && product.variations.length > 0 ? 'Variation' : '',
            existingImages: product.images || [],
            newImages: []
        });
        setIsEditMode(true);
    };

    // Handle canceling edit
    const handleCancelEdit = () => {
        setIsEditMode(false);
        setEditFormData({
            title: '',
            price: '',
            description: '',
            category: '',
            department: '',
            variations: [],
            variationType: '',
            existingImages: [],
            newImages: []
        });
    };

    // Handle saving edits
    const handleSaveEdit = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('id', product.id);
            formData.append('title', editFormData.title);
            // Ensure price is a valid number, default to 0 if empty
            formData.append('price', editFormData.price === '' ? '0' : editFormData.price);
            formData.append('description', editFormData.description);
            formData.append('category', editFormData.category);
            formData.append('department', editFormData.department);
            formData.append('stock', editFormData.stock);
            formData.append('isUnique', editFormData.isUnique);
            formData.append('stockStatus', editFormData.stockStatus);
            formData.append('variations', JSON.stringify(editFormData.variations));
            formData.append('existingImages', JSON.stringify(editFormData.existingImages));

            // Append new image files
            editFormData.newImages.forEach((file) => {
                formData.append('images', file);
            });

            console.log('Sending update for product:', product.id);
            console.log('Existing images:', editFormData.existingImages);
            console.log('New images:', editFormData.newImages.length);

            // Get Telegram WebApp initData for authentication
            const initData = window.Telegram?.WebApp?.initData || '';

            const response = await fetch(`${API_URL}/api/products`, {
                method: 'POST',
                headers: {
                    'Authorization': initData
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Update successful:', data);
                // Update local product state
                const updatedProduct = data.products.find(p => p.id === product.id);
                if (updatedProduct) {
                    setProduct(updatedProduct);
                }
                setIsEditMode(false);
                alert('Product updated successfully!');
            } else {
                const errorText = await response.text();
                console.error('Server error:', response.status, errorText);
                alert(`Failed to update product: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('Error updating product:', error);
            alert(`Error updating product: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || !product) return <div className="p-10 text-center">Loading...</div>;

    // Helper to determine stock
    const currentStock = selectedVariation
        ? (parseInt(selectedVariation.stock) || 0)
        : (parseInt(product.stock) || 0);

    // For unique items, we assume stock is managed via isUnique flag mostly, but stock should be 1.
    // However, if unique item is sold, stock becomes 0.
    const isOutOfStock = currentStock <= 0;



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

            {/* Sticky Recommended Header */}
            {showStickyHeader && (
                <div
                    className="fixed top-0 left-0 right-0 z-40 bg-[var(--tg-theme-bg-color)] border-b border-[var(--tg-theme-section-separator-color)] shadow-sm pt-2 pb-2 px-4 flex items-center"
                >
                    <div className="flex gap-2 overflow-x-auto no-scrollbar items-center w-full">
                        <button className="px-3.5 py-1 rounded-full text-sm font-medium whitespace-nowrap bg-[var(--tg-theme-button-color)] text-white shadow-md flex-shrink-0">
                            Recommended
                        </button>
                    </div>
                </div>
            )}

            {/* Product Title & Brand */}
            {/* Removed separate title block, moved below image */}

            {/* Product Title & Brand */}
            {/* Image Area */}
            <div className="w-full bg-[var(--tg-theme-secondary-bg-color)] relative pt-safe">
                {/* Admin Edit Button */}
                {isAdmin && product && !isEditMode && (
                    <button
                        onClick={handleEditClick}
                        className="absolute top-4 left-4 p-3 bg-blue-500 text-white rounded-full shadow-md z-10 hover:bg-blue-600 transition-all active:scale-95"
                        title="Edit product"
                    >
                        <Edit2 size={20} />
                    </button>
                )}

                {/* Wishlist Button */}
                <button
                    onClick={() => {
                        if (toggleWishlist && product) toggleWishlist(product.id);
                    }}
                    className="absolute top-4 right-4 p-3 bg-[var(--tg-theme-bg-color)] rounded-full shadow-md z-10 hover:bg-[var(--tg-theme-secondary-bg-color)] active:scale-95 transition-transform"
                >
                    <div>
                        <Heart
                            size={24}
                            className={`transition-colors ${wishlist.includes(product?.id) ? 'fill-[#ef4444] text-[#ef4444]' : 'text-gray-400'}`}
                        />
                    </div>
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
                            <span className="text-9xl select-none opacity-20 grayscale">No Image</span>
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

                {isEditMode ? (
                    /* Edit Mode Form */
                    <div className="space-y-4 mb-6">
                        <h2 className="text-xl font-bold text-[var(--tg-theme-text-color)] mb-4">Edit Product</h2>

                        {/* Title Input */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--tg-theme-hint-color)] mb-1">Title</label>
                            <input
                                type="text"
                                value={editFormData.title}
                                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[var(--tg-theme-text-color)] bg-[var(--tg-theme-bg-color)]"
                            />
                        </div>

                        {/* Image Management */}
                        <div className="border border-gray-200 rounded-lg p-3">
                            <label className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-2">Product Images</label>

                            {/* Existing Images */}
                            {editFormData.existingImages.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-xs text-[var(--tg-theme-hint-color)] mb-2">Current Images:</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {editFormData.existingImages.map((img, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={img}
                                                    alt={`Product ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg border border-gray-300"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newImages = editFormData.existingImages.filter((_, i) => i !== index);
                                                        setEditFormData({ ...editFormData, existingImages: newImages });
                                                    }}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New Image Upload */}
                            <div>
                                <p className="text-xs text-[var(--tg-theme-hint-color)] mb-2">Add New Images:</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files);
                                        setEditFormData({ ...editFormData, newImages: [...editFormData.newImages, ...files] });
                                    }}
                                    className="w-full text-sm text-[var(--tg-theme-text-color)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[var(--tg-theme-button-color)] file:text-white hover:file:opacity-80"
                                />
                                {editFormData.newImages.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-xs text-green-600 mb-1">{editFormData.newImages.length} new image(s) selected</p>
                                        <div className="flex flex-wrap gap-1">
                                            {editFormData.newImages.map((file, index) => (
                                                <div key={index} className="relative">
                                                    <div className="px-2 py-1 bg-gray-100 rounded text-xs flex items-center gap-1">
                                                        <span className="truncate max-w-[100px]">{file.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newFiles = editFormData.newImages.filter((_, i) => i !== index);
                                                                setEditFormData({ ...editFormData, newImages: newFiles });
                                                            }}
                                                            className="text-red-500 font-bold"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>


                        <div className="grid grid-cols-3 gap-4 border-b pb-4 mb-4 border-gray-100">
                            <div className="flex items-center pt-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editFormData.isUnique}
                                        onChange={e => setEditFormData({ ...editFormData, isUnique: e.target.checked, stock: e.target.checked ? 1 : editFormData.stock })}
                                        className="w-4 h-4 rounded text-[var(--tg-theme-button-color)]"
                                    />
                                    <span className="text-sm font-bold text-[var(--tg-theme-text-color)]">✨ Unique?</span>
                                </label>
                            </div>
                            {editFormData.isUnique ? (
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-[var(--tg-theme-hint-color)] mb-1">
                                        Status Label <span className="text-xs font-normal opacity-70">(e.g. "Vintage")</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editFormData.stockStatus}
                                        onChange={e => setEditFormData({ ...editFormData, stockStatus: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[var(--tg-theme-text-color)] bg-[var(--tg-theme-bg-color)]"
                                        placeholder="Unique"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-[var(--tg-theme-hint-color)] mb-1">
                                        Stock Qty
                                    </label>
                                    <input
                                        type="number"
                                        value={editFormData.stock}
                                        onChange={e => setEditFormData({ ...editFormData, stock: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[var(--tg-theme-text-color)] bg-[var(--tg-theme-bg-color)]"
                                        placeholder="0"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Price Input */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--tg-theme-hint-color)] mb-1">Price (Birr)</label>
                            <input
                                type="number"
                                value={editFormData.price}
                                onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[var(--tg-theme-text-color)] bg-[var(--tg-theme-bg-color)]"
                            />
                        </div>

                        {/* Description Input */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--tg-theme-hint-color)] mb-1">Description</label>
                            <textarea
                                value={editFormData.description}
                                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                rows={4}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[var(--tg-theme-text-color)] bg-[var(--tg-theme-bg-color)]"
                            />
                        </div>

                        {/* Department Select */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--tg-theme-hint-color)] mb-1">Department</label>
                            <select
                                value={editFormData.department}
                                onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value, category: '' })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[var(--tg-theme-text-color)] bg-[var(--tg-theme-bg-color)]"
                            >
                                <option value="">Select Department</option>
                                {Object.keys(SUBCATEGORIES).map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        {/* Category Select */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--tg-theme-hint-color)] mb-1">Category</label>
                            <select
                                value={editFormData.category}
                                onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[var(--tg-theme-text-color)] bg-[var(--tg-theme-bg-color)]"
                                disabled={!editFormData.department}
                            >
                                <option value="">Select Category</option>
                                {editFormData.department && SUBCATEGORIES[editFormData.department]?.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Variations Section */}
                        <div className="border-t border-gray-200 pt-4 mt-4">
                            <h3 className="text-sm font-medium text-[var(--tg-theme-text-color)] mb-3">Product Variations (Optional)</h3>

                            {/* Variation Type */}
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-[var(--tg-theme-hint-color)] mb-1">
                                    Variation Type (e.g., Size, Color, Storage)
                                </label>
                                <input
                                    type="text"
                                    value={editFormData.variationType}
                                    onChange={(e) => setEditFormData({ ...editFormData, variationType: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[var(--tg-theme-text-color)] bg-[var(--tg-theme-bg-color)]"
                                    placeholder="e.g., Storage, Size, Color"
                                />
                            </div>

                            {/* Variation Options */}
                            {editFormData.variations.map((variation, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={variation.name}
                                        onChange={(e) => {
                                            const newVariations = [...editFormData.variations];
                                            newVariations[index].name = e.target.value;
                                            setEditFormData({ ...editFormData, variations: newVariations });
                                        }}
                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-[var(--tg-theme-text-color)] bg-[var(--tg-theme-bg-color)]"
                                        placeholder={`${editFormData.variationType || 'Option'} name`}
                                    />
                                    <input
                                        type="number"
                                        value={variation.price}
                                        onChange={(e) => {
                                            const newVariations = [...editFormData.variations];
                                            newVariations[index].price = e.target.value;
                                            setEditFormData({ ...editFormData, variations: newVariations });
                                        }}
                                        className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-[var(--tg-theme-text-color)] bg-[var(--tg-theme-bg-color)]"
                                        placeholder="Price"
                                    />
                                    <input
                                        type="number"
                                        value={variation.stock}
                                        onChange={(e) => {
                                            const newVariations = [...editFormData.variations];
                                            newVariations[index].stock = e.target.value;
                                            setEditFormData({ ...editFormData, variations: newVariations });
                                        }}
                                        className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-[var(--tg-theme-text-color)] bg-[var(--tg-theme-bg-color)]"
                                        placeholder="Stock"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newVariations = editFormData.variations.filter((_, i) => i !== index);
                                            setEditFormData({ ...editFormData, variations: newVariations });
                                        }}
                                        className="px-3 py-2 bg-red-500 text-white rounded-lg active:opacity-80"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}

                            {/* Add Variation Button */}
                            <button
                                type="button"
                                onClick={() => {
                                    setEditFormData({
                                        ...editFormData,
                                        variations: [...editFormData.variations, { name: '', price: '' }]
                                    });
                                }}
                                className="w-full mt-2 py-2 border-2 border-dashed border-gray-300 rounded-lg text-[var(--tg-theme-hint-color)] active:opacity-80"
                            >
                                + Add {editFormData.variationType || 'Variation'} Option
                            </button>
                        </div>


                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 pt-4">
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCancelEdit}
                                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold active:opacity-80"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    disabled={isSaving}
                                    className="flex-1 bg-[var(--tg-theme-button-color)] text-white py-3 rounded-xl font-semibold active:opacity-80 disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>

                            <button
                                onClick={async () => {
                                    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
                                        setIsSaving(true);
                                        try {
                                            const crypto = window.crypto || window.msCrypto;
                                            // Simple random fallback if crypto not available or for simpler ID
                                            const randomId = Math.floor(Math.random() * 1000000000);

                                            // Get Telegram WebApp initData for authentication
                                            const initData = window.Telegram?.WebApp?.initData || '';

                                            const response = await fetch(`${API_URL}/api/products/${product.id}`, {
                                                method: 'DELETE',
                                                headers: {
                                                    'Authorization': initData
                                                }
                                            });

                                            if (response.ok) {
                                                alert('Product deleted successfully');
                                                navigate('/');
                                            } else {
                                                const text = await response.text();
                                                alert(`Failed to delete: ${text}`);
                                            }
                                        } catch (error) {
                                            console.error('Error deleting product:', error);
                                            alert(`Error deleting product: ${error.message}`);
                                        } finally {
                                            setIsSaving(false);
                                        }
                                    }
                                }}
                                disabled={isSaving}
                                className="w-full bg-red-100 text-red-600 py-3 rounded-xl font-semibold active:opacity-80 border border-red-200"
                            >
                                Delete Product
                            </button>
                        </div>
                    </div>
                ) : (
                    /* View Mode */
                    <>
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

                            <div className="flex items-baseline gap-2">
                                {selectedVariation ? (
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-[var(--tg-theme-text-color)]">
                                            {Math.floor(selectedVariation.price)}
                                        </span>
                                        <span className="text-sm font-medium text-[var(--tg-theme-hint-color)]">Birr</span>
                                    </div>
                                ) : (
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-[var(--tg-theme-text-color)]">
                                            {Math.floor(product.price)}
                                        </span>
                                        <span className="text-sm font-medium text-[var(--tg-theme-hint-color)]">Birr</span>
                                    </div>
                                )}
                            </div>

                            {/* Stock Status Badge */}
                            <div className="mt-2">
                                {product.isUnique ? (
                                    <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded border border-purple-200">
                                        ✨ {product.stockStatus || 'One of a Kind'}
                                    </span>
                                ) : (
                                    <>
                                        {isOutOfStock ? (
                                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded border border-gray-200">
                                                Sold Out
                                            </span>
                                        ) : (
                                            currentStock < 10 && (
                                                <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded border border-red-200">
                                                    🔥 Only {currentStock} left!
                                                </span>
                                            )
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-[var(--tg-theme-hint-color)] uppercase tracking-wide mb-1.5">Description</h3>
                                <p className="text-[var(--tg-theme-text-color)] leading-relaxed text-sm opacity-90 whitespace-pre-wrap">
                                    {product.description || "No description available."}
                                </p>
                            </div>
                        </div>
                    </>
                )}


                {/* Call & Add to Cart Action */}
                <div className="flex gap-3 mt-6 mb-2">
                    {product.seller_phone && (
                        <a
                            href={`tel:${product.seller_phone}`}
                            className="flex-1 bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-text-color)] py-3 rounded-xl font-semibold text-base shadow border border-[var(--tg-theme-button-color)] flex items-center justify-center active:opacity-80 transition-opacity"
                        >
                            Call
                        </a>
                    )}
                    <button
                        onClick={() => {
                            if (isOutOfStock) return;
                            // Use the centralized Buy Now logic (which uses sendData for auto-send)
                            if (onBuyNow) {
                                onBuyNow({ ...product, selectedVariation });
                            }
                        }}
                        disabled={isOutOfStock}
                        className={`flex-1 py-3 rounded-xl font-semibold text-base shadow active:opacity-80 transition-opacity flex items-center justify-center gap-1 ${isOutOfStock
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-500 text-white'
                            }`}
                    >
                        <Zap size={18} fill="currentColor" /> {isOutOfStock ? 'Sold Out' : 'Buy Now'}
                    </button>
                    <button
                        onClick={() => {
                            if (isOutOfStock) return;
                            const finalPrice = selectedVariation
                                ? selectedVariation.price
                                : product.price;

                            onAdd({ ...product, selectedVariation, price: finalPrice });
                            setIsAdded(true);
                            navigate('/cart');
                        }}
                        disabled={isOutOfStock}
                        className={`flex-[2] py-3 rounded-xl font-semibold text-base shadow flex items-center justify-center gap-2 overflow-hidden relative transition-colors ${isOutOfStock
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : (isAdded ? 'bg-green-500 text-white' : 'bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)]')
                            }`}
                    >
                        {isOutOfStock ? (
                            <span>Sold Out</span>
                        ) : (
                            <>
                                <div
                                    className={`absolute transition-all duration-300 ${isAdded ? 'opacity-0 -translate-y-8' : 'opacity-100 translate-y-0'}`}
                                >
                                    Add to Cart
                                </div>
                                <div
                                    className={`absolute flex items-center gap-2 font-bold transition-all duration-300 ${isAdded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                                >
                                    <Check size={20} />
                                    Added
                                </div>
                                {/* Invisible spacer to maintain width/height */}
                                <span className="opacity-0">Add to Cart</span>
                            </>
                        )}
                    </button>
                </div>
            </div>





            {/* Recommended Products Grid */}
            {relatedProducts.length > 0 && (
                <div
                    ref={recommendedRef}
                    className="p-4 pt-6 bg-[var(--tg-theme-secondary-bg-color)] mt-4 border-t border-[var(--tg-theme-section-separator-color)]"
                >
                    <h3 className="text-lg font-bold text-[var(--tg-theme-text-color)] mb-4 flex items-center gap-2">
                        Recommended for You
                    </h3>
                    <ProductList products={relatedProducts} />
                </div>
            )}
        </div>
    );
};

export default ProductDetails;
