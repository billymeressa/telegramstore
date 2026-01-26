import { useState, useEffect } from 'react';
import API_URL from '../config';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Heart, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { trackEvent } from '../utils/track';

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


const ProductDetails = ({ onAdd, wishlist = [], toggleWishlist, products = [], isAdmin = false }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [selectedImage, setSelectedImage] = useState(null);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariation, setSelectedVariation] = useState(null);


    // Edit mode states
    const [isEditMode, setIsEditMode] = useState(false);
    const [editFormData, setEditFormData] = useState({
        title: '',
        price: '',
        description: '',
        category: '',
        department: '',
        variations: [],
        variationType: '',
        existingImages: [],  // URLs of existing images
        newImages: []        // File objects for new uploads
    });
    const [isSaving, setIsSaving] = useState(false);

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

    // Handle entering edit mode
    const handleEditClick = () => {
        setEditFormData({
            title: product.title || '',
            price: product.price || '',
            description: product.description || '',
            category: product.category || '',
            department: product.department || '',
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
                <motion.button
                    initial={{ scale: 1 }}
                    whileTap={{ scale: 0.8 }}
                    onClick={() => {
                        if (toggleWishlist && product) toggleWishlist(product.id);
                    }}
                    className="absolute top-4 right-4 p-3 bg-[var(--tg-theme-bg-color)] rounded-full shadow-md z-10 hover:bg-[var(--tg-theme-secondary-bg-color)] active:scale-95"
                >
                    <motion.div
                        animate={{
                            scale: wishlist.includes(product?.id) ? [1, 1.5, 1] : 1,
                            rotate: wishlist.includes(product?.id) ? [0, 15, -15, 0] : 0
                        }}
                        transition={{ duration: 0.4 }}
                    >
                        <Heart
                            size={24}
                            className={`transition-colors ${wishlist.includes(product?.id) ? 'fill-[#ef4444] text-[#ef4444]' : 'text-gray-400'}`}
                        />
                    </motion.div>
                </motion.button>

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
                                        <img
                                            src={rel.images[0]}
                                            alt={rel.title}
                                            className="max-w-full max-h-full object-contain"
                                            loading="lazy"
                                            decoding="async"
                                        />
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
