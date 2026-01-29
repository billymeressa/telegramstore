import { useState, useEffect, useRef } from 'react';
import API_URL from '../config';
import { LayoutDashboard, Package, Truck, CheckCircle, XCircle, Settings } from 'lucide-react';
import NativeHeader from '../components/NativeHeader';

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

const AdminDashboard = ({ products, onProductUpdate }) => {
    const tele = window.Telegram?.WebApp;
    const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders'
    const [newProduct, setNewProduct] = useState({ title: '', price: '', stock: 1, isUnique: true, stockStatus: 'Distinct', category: '', department: 'Men', description: '', images: [], variations: [] });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mainImageFile, setMainImageFile] = useState(null);
    const [additionalImageFiles, setAdditionalImageFiles] = useState([]);
    const [editId, setEditId] = useState(null); // Track if editing
    const fileInputRef = useRef(null);
    const [orders, setOrders] = useState([]);
    const [variationType, setVariationType] = useState(''); // e.g., "Storage", "Size", "Color"
    const [globalSettings, setGlobalSettings] = useState({ global_sale_intensity: 'medium' });

    useEffect(() => {
        if (activeTab === 'settings') {
            fetchSettings();
        }
    }, [activeTab]);

    const fetchSettings = () => {
        if (!API_URL) return;
        fetch(`${API_URL}/api/settings`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.settings) {
                    setGlobalSettings(data.settings);
                }
            })
            .catch(err => console.error("Error fetching settings:", err));
    };

    const updateGlobalSetting = async (key, value) => {
        try {
            const tele = window.Telegram?.WebApp;
            const res = await fetch(`${API_URL}/api/settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': tele?.initData || ''
                },
                body: JSON.stringify({ key, value })
            });
            const data = await res.json();
            if (data.success) {
                setGlobalSettings(prev => ({ ...prev, [key]: value }));
                tele ? tele.showAlert('Settings Updated!') : alert('Settings Updated!');
            } else {
                alert('Failed to update: ' + data.error);
            }
        } catch (err) {
            console.error(err);
            alert('Error updating setting');
        }
    };



    useEffect(() => {
        if (activeTab === 'orders') {
            fetchOrders();
        }
    }, [activeTab]);

    const fetchOrders = () => {
        if (!API_URL) {
            console.error('API_URL is undefined! Check your config.js');
            return;
        }
        fetch(`${API_URL}/api/orders`)
            .then(res => res.json())
            .then(data => setOrders(data.reverse()))
            .catch(err => console.error('Error fetching orders:', err));
    };



    const removeExistingImage = (index) => {
        setNewProduct(prev => {
            const updated = [...prev.images];
            updated.splice(index, 1);
            return { ...prev, images: updated };
        });
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newProduct.title || !newProduct.price) {
            const msg = 'Please fill in Title and Price';
            tele ? tele.showAlert(msg) : alert(msg);
            return;
        }

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('title', newProduct.title);
        formData.append('price', newProduct.price);
        formData.append('stock', newProduct.stock || '0');
        formData.append('isUnique', newProduct.isUnique);
        formData.append('stockStatus', newProduct.stockStatus || '');
        formData.append('category', newProduct.category || 'General');
        formData.append('department', newProduct.department || 'Men');
        formData.append('description', newProduct.description || '');

        // Append existing images
        if (newProduct.images && newProduct.images.length > 0) {
            newProduct.images.forEach(img => formData.append('existingImages', img));
        }

        // Append Main Image FIRST (to ensure it's index 0 if new)
        // If we are editing, and didn't select a new main image, the existing main image is at newProduct.images[0]
        if (mainImageFile) {
            formData.append('images', mainImageFile);
        }

        // Append Additional Images
        if (additionalImageFiles && additionalImageFiles.length > 0) {
            Array.from(additionalImageFiles).forEach(file => {
                formData.append('images', file);
            });
        }

        // Append variations as JSON string
        if (newProduct.variations && newProduct.variations.length > 0) {
            formData.append('variations', JSON.stringify(newProduct.variations));
        }

        if (editId) {
            formData.append('id', editId);
        }

        try {
            const url = `${API_URL}/api/products`;

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': tele?.initData || ''
                },
                body: formData, // FormData handles Content-Type automatically
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Server responded with ${res.status}: ${text.substring(0, 100)}`);
            }

            const data = await res.json();
            if (data.success) {
                onProductUpdate(data.products);
                setNewProduct({ title: '', price: '', stock: 1, isUnique: true, stockStatus: 'Distinct', category: '', department: 'Men', description: '', images: [], variations: [] });
                setMainImageFile(null);
                setAdditionalImageFiles([]);
                setEditId(null);
                setVariationType('');
                if (fileInputRef.current) fileInputRef.current.value = '';
                const successMsg = 'Product Saved Successfully!';
                tele ? tele.showAlert(successMsg) : alert(successMsg);
            } else {
                const errorMsg = 'Failed to add product: ' + (data.error || 'Unknown error');
                tele ? tele.showAlert(errorMsg) : alert(errorMsg);
            }
        } catch (err) {
            console.error("FULL ERROR OBJECT:", err);
            const sysError = `Error saving product: ${err.message || 'Unknown network error'}. Check console for details.`;
            tele ? tele.showAlert(sysError) : alert(sysError);
        } finally {
            setIsSubmitting(false);
        }
    };

    const startEdit = (product) => {
        setNewProduct({
            title: product.title,
            price: product.price,
            stock: product.stock || '',
            isUnique: product.isUnique || false,
            stockStatus: product.stockStatus || '',
            category: product.category,
            department: product.department || 'Men',
            description: product.description || '',
            images: product.images || [],
            variations: product.variations || []
        });
        setEditId(product.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setNewProduct({ title: '', price: '', stock: 1, isUnique: true, stockStatus: 'Distinct', category: '', department: 'Men', description: '', images: [], variations: [] });
        setMainImageFile(null);
        setAdditionalImageFiles([]);
        setEditId(null);
        setVariationType('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            const res = await fetch(`${API_URL}/api/products/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': tele?.initData || ''
                }
            });
            const data = await res.json();
            if (data.success) {
                onProductUpdate(data.products);
            } else {
                alert('Failed to delete: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting product');
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': tele?.initData || ''
                },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                fetchOrders(); // Refresh list associated with this component
            }
        } catch (err) {
            console.error(err);
            alert('Error updating status');
        }
    };

    return (
        <div className="bg-white rounded-md shadow-sm border border-gray-200 mt-4 overflow-hidden pt-[calc(var(--tg-content-safe-area-top)+44px)]">
            <NativeHeader title="Seller Dashboard" />
            <div className="bg-[var(--tg-theme-button-color)] p-4">
                <h2 className="text-xl font-bold text-[var(--tg-theme-button-text-color)] flex items-center gap-2">
                    <LayoutDashboard size={24} />
                    Addis Seller Dashboard
                </h2>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50">
                <button
                    onClick={() => setActiveTab('products')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'products' ? 'bg-[var(--tg-theme-bg-color)] border-t-2 border-[var(--tg-theme-button-color)] text-[var(--tg-theme-text-color)] font-bold' : 'text-[var(--tg-theme-hint-color)] hover:text-[var(--tg-theme-text-color)]'}`}
                >
                    Inventory
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-[var(--tg-theme-bg-color)] border-t-2 border-[var(--tg-theme-button-color)] text-[var(--tg-theme-text-color)] font-bold' : 'text-[var(--tg-theme-hint-color)] hover:text-[var(--tg-theme-text-color)]'}`}
                >
                    Orders
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-[var(--tg-theme-bg-color)] border-t-2 border-[var(--tg-theme-button-color)] text-[var(--tg-theme-text-color)] font-bold' : 'text-[var(--tg-theme-hint-color)] hover:text-[var(--tg-theme-text-color)]'}`}
                >
                    Engine
                </button>
            </div>

            <div className="p-6">
                {activeTab === 'settings' ? (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                            <h3 className="flex items-center gap-2 font-bold text-blue-900 text-lg mb-2">
                                <Settings size={20} />
                                Automated Sales & Promotion Engine
                            </h3>
                            <p className="text-sm text-blue-800 leading-relaxed">
                                Control the intensity of automated marketing features like Flash Sales and Social Proof indicators.
                            </p>
                        </div>

                        <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                            <label className="block text-sm font-bold text-[#0F1111] mb-2">
                                Global Sale Intensity
                            </label>
                            <p className="text-xs text-gray-500 mb-3">
                                Determines frequency of Flash Sales and magnitude of Social Proof counters.
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                                {['low', 'medium', 'high'].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => updateGlobalSetting('global_sale_intensity', level)}
                                        className={`py-3 px-4 rounded-lg border text-sm font-bold capitalize transition-all ${globalSettings.global_sale_intensity === level
                                                ? 'bg-[var(--tg-theme-button-color)] text-white border-transparent shadow'
                                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-3 text-xs bg-gray-50 p-2 rounded text-gray-600 italic">
                                <strong>Effect:</strong> {
                                    globalSettings.global_sale_intensity === 'low' ? 'Minimal urgency. No timers.' :
                                        globalSettings.global_sale_intensity === 'high' ? 'High urgency! Frequent flash sales & 3x social proof.' :
                                            'Balanced approach. Occasional timers & 1.5x social proof.'
                                }
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'products' ? (
                    <>
                        {/* Add/Edit Form */}
                        <form onSubmit={handleAdd} className="space-y-4 mb-8 bg-gray-50 p-4 rounded border border-gray-200">
                            <h3 className="font-bold text-[#0F1111] border-b pb-2 mb-2">{editId ? 'Edit Product' : 'Add New Product'}</h3>
                            <div>
                                <label className="block text-xs font-bold text-[#0F1111] mb-1">Title</label>
                                <input
                                    value={newProduct.title}
                                    onChange={e => setNewProduct({ ...newProduct, title: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-[var(--tg-theme-button-color)] focus:ring-1 focus:ring-[var(--tg-theme-button-color)] outline-none bg-white text-[#0F1111] placeholder-gray-400"
                                    placeholder="Product Name"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#0F1111] mb-1">
                                        Price {newProduct.variations && newProduct.variations.length > 0 && (
                                            <span className="text-xs font-normal text-gray-500">(Optional - using variation prices)</span>
                                        )}
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={newProduct.price}
                                        onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-[var(--tg-theme-button-color)] focus:ring-1 focus:ring-[var(--tg-theme-button-color)] outline-none bg-white text-[#0F1111] placeholder-gray-400"
                                        placeholder={newProduct.variations && newProduct.variations.length > 0 ? "Base price (optional)" : "0.00"}
                                    />
                                    {newProduct.variations && newProduct.variations.length > 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            💡 Price will be determined by selected variation
                                        </p>
                                    )}
                                </div>
                            </div>



                            <div className="grid grid-cols-3 gap-4 border-t pt-4 border-gray-100 mt-2">
                                <div className="flex items-center pt-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newProduct.isUnique}
                                            onChange={e => setNewProduct({ ...newProduct, isUnique: e.target.checked, stock: e.target.checked ? 1 : newProduct.stock })}
                                            className="w-4 h-4 rounded text-[var(--tg-theme-button-color)]"
                                        />
                                        <span className="text-xs font-bold text-[#0F1111]">✨ One of a Kind?</span>
                                    </label>
                                </div>
                                {newProduct.isUnique ? (
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-[#0F1111] mb-1">
                                            Status Label <span className="text-xs font-normal text-gray-500">(Optional, e.g. "Vintage")</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={newProduct.stockStatus}
                                            onChange={e => setNewProduct({ ...newProduct, stockStatus: e.target.value })}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none bg-white text-[#0F1111]"
                                            placeholder="Unique"
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-xs font-bold text-[#0F1111] mb-1">
                                            Stock Quantity
                                        </label>
                                        <input
                                            type="number"
                                            value={newProduct.stock}
                                            onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none bg-white text-[#0F1111]"
                                            placeholder="0"
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#0F1111] mb-1">Department</label>
                                <select
                                    value={newProduct.department}
                                    onChange={e => setNewProduct({ ...newProduct, department: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-[var(--tg-theme-button-color)] focus:ring-1 focus:ring-[var(--tg-theme-button-color)] outline-none bg-white text-[#0F1111]"
                                >
                                    <option value="Men">Men</option>
                                    <option value="Women">Women</option>
                                    <option value="Kids">Kids</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Home">Home</option>
                                    <option value="Beauty">Beauty</option>
                                    <option value="Books">Books</option>
                                    <option value="Sports">Sports</option>
                                </select>
                            </div>


                            <div>
                                <label className="block text-xs font-bold text-[#0F1111] mb-1">Category</label>
                                <select
                                    value={newProduct.category}
                                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-[var(--tg-theme-button-color)] focus:ring-1 focus:ring-[var(--tg-theme-button-color)] outline-none bg-white text-[#0F1111]"
                                >
                                    <option value="">Select Category</option>
                                    {(SUBCATEGORIES[newProduct.department] || []).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#0F1111] mb-1">Description</label>
                                <textarea
                                    value={newProduct.description}
                                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-[var(--tg-theme-button-color)] focus:ring-1 focus:ring-[var(--tg-theme-button-color)] outline-none h-20 bg-white text-[#0F1111] placeholder-gray-400"
                                    placeholder="Product details..."
                                />
                            </div>

                            {/* Product Variations */}
                            <div className="border-t border-gray-200 pt-3">
                                <label className="block text-sm font-bold text-[#0F1111] mb-2">
                                    Product Variations <span className="text-xs font-normal text-gray-500">(Optional)</span>
                                </label>

                                {/* Step 1: Variation Type */}
                                <div className="mb-3">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Variation Type <span className="text-gray-500">(e.g., Storage, Size, Color)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={variationType}
                                        onChange={e => setVariationType(e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[var(--tg-theme-button-color)] focus:ring-1 focus:ring-[var(--tg-theme-button-color)] outline-none bg-white"
                                        placeholder="e.g., Storage, Size, Color"
                                    />
                                    {variationType && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Adding options for: <span className="font-semibold">{variationType}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Step 2: Variation Options */}
                                {newProduct.variations && newProduct.variations.length > 0 && (
                                    <div className="space-y-2 mb-3">
                                        <p className="text-xs font-medium text-gray-700">
                                            {variationType || 'Variation'} Options:
                                        </p>
                                        {newProduct.variations.map((variation, idx) => (
                                            <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded border border-gray-200">
                                                <div className="flex-1 grid grid-cols-2 gap-2">
                                                    <input
                                                        type="text"
                                                        value={variation.name}
                                                        onChange={e => {
                                                            const updated = [...newProduct.variations];
                                                            updated[idx].name = e.target.value;
                                                            setNewProduct({ ...newProduct, variations: updated });
                                                        }}
                                                        className="border border-gray-300 rounded px-2 py-1.5 text-sm"
                                                        placeholder={`${variationType || 'Option'} (e.g., 16GB)`}
                                                    />
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={variation.price}
                                                        onChange={e => {
                                                            const updated = [...newProduct.variations];
                                                            updated[idx].price = e.target.value;
                                                            setNewProduct({ ...newProduct, variations: updated });
                                                        }}
                                                        className="border border-gray-300 rounded px-2 py-1.5 text-sm"
                                                        placeholder="Price (Birr)"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={variation.stock}
                                                        onChange={e => {
                                                            const updated = [...newProduct.variations];
                                                            updated[idx].stock = e.target.value;
                                                            setNewProduct({ ...newProduct, variations: updated });
                                                        }}
                                                        className="border border-gray-300 rounded px-2 py-1.5 text-sm w-20"
                                                        placeholder="Stock"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = newProduct.variations.filter((_, i) => i !== idx);
                                                        setNewProduct({ ...newProduct, variations: updated });
                                                    }}
                                                    className="bg-red-500 text-white px-2 py-1.5 rounded text-xs hover:bg-red-600 flex-shrink-0"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => {
                                        setNewProduct({
                                            ...newProduct,
                                            variations: [...newProduct.variations, { name: '', price: '', stock: '' }]
                                        });
                                    }}
                                    className="bg-[var(--tg-theme-button-color)] text-white px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"
                                >
                                    + Add {variationType || 'Variation'} Option
                                </button>
                            </div>

                            {/* Image Upload Section */}
                            <div className="space-y-3 border-t border-gray-200 pt-3">
                                <label className="block text-sm font-bold text-[#0F1111]">Product Images</label>

                                {/* Existing Images Preview */}
                                {newProduct.images && newProduct.images.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {newProduct.images.map((img, idx) => (
                                            <div key={idx} className="relative w-20 h-20 border rounded bg-white flex items-center justify-center group">
                                                <img src={img} className="max-w-full max-h-full object-contain" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingImage(idx)}
                                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600 shadow-sm z-10"
                                                >
                                                    &times;
                                                </button>
                                                {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center">Main</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Main Image Input */}
                                <div>
                                    <label className="block text-xs font-bold text-[#0F1111] mb-1">Main Image <span className="text-red-500">*</span></label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setMainImageFile(e.target.files[0])}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--tg-theme-button-color)] file:text-[var(--tg-theme-button-text-color)] hover:file:opacity-90"
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1">This will be the primary thumbnail.</p>
                                </div>

                                {/* Additional Images Input */}
                                <div>
                                    <label className="block text-xs font-bold text-[#0F1111] mb-1">Additional Images</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        ref={fileInputRef}
                                        onChange={e => setAdditionalImageFiles(e.target.files)}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1">Select multiple files for the gallery.</p>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                {editId && (
                                    <button type="button" onClick={cancelEdit} className="flex-1 bg-white border border-gray-300 text-[#0F1111] font-medium py-2 rounded-md shadow-sm hover:bg-gray-50">
                                        Cancel
                                    </button>
                                )}
                                <button type="submit" disabled={isSubmitting} className="flex-1 bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-medium py-2 rounded-md shadow-sm active:opacity-80 disabled:opacity-50">
                                    {isSubmitting ? 'Saving...' : (editId ? 'Save Changes' : 'Add Product')}
                                </button>
                            </div>
                        </form>

                        {/* List */}
                        <div className="space-y-2">
                            {products.map(p => (
                                <div key={p.id} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded">
                                            {p.images && p.images.length > 0 ? <img src={p.images[0]} className="w-full h-full object-contain" /> : 'Pack'}
                                        </div>
                                        <div>
                                            <div className="font-bold text-[#0F1111] text-sm">{p.title}</div>
                                            <div className="text-xs text-gray-500">{p.price} Birr • {p.department}</div>
                                            <div className="text-xs mt-1">
                                                {p.isUnique ? (
                                                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold border border-purple-200 text-[10px]">
                                                        {p.stockStatus || 'Unique'}
                                                    </span>
                                                ) : (
                                                    <span className={`px-2 py-0.5 rounded-full font-bold border text-[10px] ${(p.variations && p.variations.length > 0)
                                                        ? 'bg-gray-100 text-gray-600 border-gray-200' // Variations managed separately
                                                        : (p.stock < 10 ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200')
                                                        }`}>
                                                        {(p.variations && p.variations.length > 0)
                                                            ? `${p.variations.reduce((acc, v) => acc + (parseInt(v.stock) || 0), 0)} in stock (Var)`
                                                            : `${p.stock || 0} in stock`
                                                        }
                                                        {!(p.variations && p.variations.length > 0) && (p.stock < 10) && ' (Low)'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => startEdit(p)} className="text-[var(--tg-theme-button-color)] hover:underline text-sm font-medium">Edit</button>
                                        <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline text-sm font-medium">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="space-y-4">
                        {orders.length === 0 && <div className="text-center py-8 text-gray-500">No orders found.</div>}
                        {orders.map(order => (
                            <div key={order.id} className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="font-bold text-[var(--tg-theme-button-color)]">Order #{order.id}</div>
                                        <div className="text-xs text-[var(--tg-theme-hint-color)]">
                                            by {order.userInfo?.first_name}
                                        </div>
                                    </div>
                                    <div className={`text-xs font-bold px-2 py-1 rounded border uppercase ${order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                        order.status === 'sold' ? 'bg-green-50 text-green-700 border-green-200' :
                                            order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                                'bg-gray-50 text-gray-700 border-gray-200'
                                        }`}>
                                        {order.status}
                                    </div>
                                </div>

                                <div className="text-sm text-[#0F1111] mb-2 pl-2 border-l-2 border-gray-100">
                                    {order.items.map((item, i) => (
                                        <div key={i}>
                                            <span className="font-bold">{item.quantity}x</span> {item.title}
                                            {item.selectedVariations && (
                                                <span className="text-xs text-gray-500 ml-1">
                                                    ({Object.entries(item.selectedVariations).map(([k, v]) => `${k}: ${v}`).join(', ')})
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="text-right font-bold text-[var(--tg-theme-button-color)] mb-3">
                                    Total: {Math.floor(order.total_price)} Birr
                                </div>

                                <div className="flex gap-2">
                                    <button onClick={() => handleUpdateStatus(order.id, 'sold')} className="flex-1 bg-[#F0FDF9] border border-green-200 text-green-700 font-bold text-sm py-2 rounded hover:bg-green-50">
                                        Mark as Sold
                                    </button>
                                    <button onClick={() => handleUpdateStatus(order.id, 'cancelled')} className="flex-1 bg-[#FEF2F2] border border-red-200 text-red-700 font-bold text-sm py-2 rounded hover:bg-red-50">
                                        Cancel Order
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
};

export default AdminDashboard;
