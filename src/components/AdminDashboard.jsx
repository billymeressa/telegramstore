import { useState, useEffect, useRef } from 'react';
import API_URL from '../config';
import { LayoutDashboard, Package, Truck, CheckCircle, XCircle, Settings, Calculator, BarChart2 } from 'lucide-react';
import SalesSimulator from './SalesSimulator';
import AnalyticsDashboard from '../pages/AnalyticsDashboard';


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
    const [globalSettings, setGlobalSettings] = useState({ global_sale_intensity: 'medium', home_banners: [] });

    // Banner Logic
    const [newBanner, setNewBanner] = useState({ title: '', description: '', buttonText: 'Shop Now', gradient: 'from-primary to-orange-400', image: '' });

    const addBanner = () => {
        const updatedBanners = [...(globalSettings.home_banners || []), newBanner];
        updateAndPersist('home_banners', updatedBanners);
        setNewBanner({ title: '', description: '', buttonText: 'Shop Now', gradient: 'from-primary to-orange-400', image: '' });
    };

    const removeBanner = (index) => {
        const updatedBanners = [...(globalSettings.home_banners || [])];
        updatedBanners.splice(index, 1);
        updateAndPersist('home_banners', updatedBanners);
    };

    const GRADIENTS = [
        { label: 'Blue (Default)', value: 'from-primary to-blue-500' },
        { label: 'Orange Sunset', value: 'from-primary to-orange-400' },
        { label: 'Purple Haze', value: 'from-purple-500 to-indigo-600' },
        { label: 'Green Energy', value: 'from-green-400 to-emerald-600' },
        { label: 'Red Alert', value: 'from-red-500 to-pink-600' }
    ];

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

    const updateLocalSetting = (key, value) => {
        setGlobalSettings(prev => ({ ...prev, [key]: value }));
    };

    const persistSetting = async (key, value) => {
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
                // Success - state is already updated locally
                // tele ? tele.showAlert('Settings Saved') : console.log('Saved');
                // Optional: Show subtle feedback instead of full alert to avoid spamming
            } else {
                alert('Failed to save: ' + data.error);
                // Optional: Revert local state here if needed
            }
        } catch (err) {
            console.error(err);
            alert('Error saving setting');
        }
    };

    // Helper for non-slider inputs (immediate save)
    const updateAndPersist = (key, value) => {
        updateLocalSetting(key, value);
        persistSetting(key, value);
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
        <div className="bg-white rounded-md shadow-sm border border-gray-200 mt-4 overflow-hidden pt-[var(--tg-content-safe-area-top)]">
            <div className="bg-primary p-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <LayoutDashboard size={24} />
                    Addis Seller Dashboard
                </h2>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50">
                <button
                    onClick={() => setActiveTab('products')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'products' ? 'bg-white border-t-2 border-primary text-black font-bold' : 'text-gray-500 hover:text-black'}`}
                >
                    Inventory
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-white border-t-2 border-primary text-black font-bold' : 'text-gray-500 hover:text-black'}`}
                >
                    Orders
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-white border-t-2 border-primary text-black font-bold' : 'text-gray-500 hover:text-black'}`}
                >
                    Engine
                </button>
                <button
                    onClick={() => setActiveTab('simulator')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'simulator' ? 'bg-white border-t-2 border-primary text-black font-bold' : 'text-gray-500 hover:text-black'}`}
                >
                    Simulator
                </button>
                <button
                    onClick={() => setActiveTab('analytics')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'analytics' ? 'bg-white border-t-2 border-primary text-black font-bold' : 'text-gray-500 hover:text-black'}`}
                >
                    Analytics
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

                        <div className="space-y-4">
                            {/* Global Intensity */}
                            <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                                <label className="block text-sm font-bold text-[#0F1111] mb-2">
                                    Global Sale Intensity
                                </label>
                                <p className="text-xs text-gray-500 mb-3">
                                    Determines frequency of general promotional badges and urgency.
                                </p>
                                <div className="grid grid-cols-3 gap-2">
                                    {['low', 'medium', 'high'].map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => updateAndPersist('global_sale_intensity', level)}
                                            className={`py-3 px-4 rounded-lg border text-sm font-bold capitalize transition-all ${globalSettings.global_sale_intensity === level
                                                ? 'bg-primary text-white border-transparent shadow'
                                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Discount Range Settings */}
                            <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                                <label className="block text-sm font-bold text-[#0F1111] mb-2">
                                    Automatic Discount Range
                                </label>
                                <p className="text-xs text-gray-500 mb-3">
                                    Set the minimum and maximum percentage off generated for new products.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Min Discount %</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="90"
                                            value={(globalSettings.system_discount_min || 0.15) * 100}
                                            onChange={(e) => updateAndPersist('system_discount_min', parseFloat(e.target.value) / 100)}
                                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Max Discount %</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="90"
                                            value={(globalSettings.system_discount_max || 0.35) * 100}
                                            onChange={(e) => updateAndPersist('system_discount_max', parseFloat(e.target.value) / 100)}
                                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Flash Sale Probability */}
                            <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                                <label className="block text-sm font-bold text-[#0F1111] mb-2">
                                    Flash Sale Frequency
                                </label>
                                <p className="text-xs text-gray-500 mb-3">
                                    Probability that a product shows a countdown timer (0% - 100%).
                                </p>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={(globalSettings.system_flash_sale_prob || 0.2) * 100}
                                        onChange={(e) => updateLocalSetting('system_flash_sale_prob', parseFloat(e.target.value) / 100)}
                                        onMouseUp={(e) => persistSetting('system_flash_sale_prob', parseFloat(e.target.value) / 100)}
                                        onTouchEnd={(e) => persistSetting('system_flash_sale_prob', parseFloat(e.target.value) / 100)}
                                        className="flex-1"
                                    />
                                    <span className="text-sm font-bold w-12 text-right">
                                        {Math.round((globalSettings.system_flash_sale_prob || 0.2) * 100)}%
                                    </span>
                                </div>
                            </div>

                            {/* Social Proof Multiplier */}
                            <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                                <label className="block text-sm font-bold text-[#0F1111] mb-2">
                                    Social Proof Multiplier
                                </label>
                                <p className="text-xs text-gray-500 mb-3">
                                    Multiplies the "Viewers right now" count to create urgency.
                                </p>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        step="0.1"
                                        value={globalSettings.system_social_proof_mult || 1.5}
                                        onChange={(e) => updateLocalSetting('system_social_proof_mult', parseFloat(e.target.value))}
                                        onMouseUp={(e) => persistSetting('system_social_proof_mult', parseFloat(e.target.value))}
                                        onTouchEnd={(e) => persistSetting('system_social_proof_mult', parseFloat(e.target.value))}
                                        className="flex-1"
                                    />
                                    <span className="text-sm font-bold w-12 text-right">
                                        {globalSettings.system_social_proof_mult || 1.5}x
                                    </span>
                                </div>
                            </div>

                            {/* Banner Management */}
                            <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                                <label className="block text-sm font-bold text-[#0F1111] mb-2">
                                    Home Screen Banners
                                </label>
                                <p className="text-xs text-gray-500 mb-3">
                                    Add custom banners to the home carousel.
                                </p>

                                {/* List Existing Banners */}
                                <div className="space-y-2 mb-4">
                                    {(!globalSettings.home_banners || globalSettings.home_banners.length === 0) && (
                                        <div className="text-xs text-center p-3 bg-gray-50 rounded text-gray-400">
                                            No custom banners. Showing default "Super Flash Sale".
                                        </div>
                                    )}
                                    {(globalSettings.home_banners || []).map((b, idx) => (
                                        <div key={idx} className={`p-3 rounded-lg text-white bg-gradient-to-r ${b.gradient} relative overflow-hidden group`}>
                                            {b.image && <img src={b.image} className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none" />}
                                            <div className="relative z-10">
                                                <div className="font-bold text-sm">{b.title}</div>
                                                <div className="text-[10px] opacity-90">{b.description}</div>
                                            </div>
                                            <button onClick={() => removeBanner(idx)} className="absolute top-2 right-2 bg-white/20 hover:bg-white/40 rounded-full w-6 h-6 flex items-center justify-center text-xs backdrop-blur-sm transition-colors">
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Add New Banner Form */}
                                <div className="bg-gray-50 p-3 rounded border border-gray-100 space-y-2">
                                    <input
                                        placeholder="Title (e.g., Summer Sale)"
                                        value={newBanner.title}
                                        onChange={e => setNewBanner({ ...newBanner, title: e.target.value })}
                                        className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
                                    />
                                    <input
                                        placeholder="Description"
                                        value={newBanner.description}
                                        onChange={e => setNewBanner({ ...newBanner, description: e.target.value })}
                                        className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            placeholder="Button Text"
                                            value={newBanner.buttonText}
                                            onChange={e => setNewBanner({ ...newBanner, buttonText: e.target.value })}
                                            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
                                        />
                                        <select
                                            value={newBanner.gradient}
                                            onChange={e => setNewBanner({ ...newBanner, gradient: e.target.value })}
                                            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
                                        >
                                            {GRADIENTS.map(g => (
                                                <option key={g.value} value={g.value}>{g.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <input
                                        placeholder="Image URL (Optional)"
                                        value={newBanner.image}
                                        onChange={e => setNewBanner({ ...newBanner, image: e.target.value })}
                                        className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
                                    />
                                    <button onClick={addBanner} disabled={!newBanner.title} className="w-full bg-primary text-white py-2 rounded text-xs font-bold disabled:opacity-50">
                                        + Add Banner
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Gamification Settings */}
                        <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-[#0F1111] mb-4 flex items-center gap-2">
                                <span className="text-xl">🎮</span> Gamification & Rewards
                            </h3>

                            {/* Slots */}
                            <div className="mb-4 bg-purple-50 p-3 rounded border border-purple-100">
                                <h4 className="font-bold text-sm text-purple-900 mb-2">🎰 Slot Machine</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Win Probability</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="range" min="0" max="100" step="5"
                                                value={(globalSettings.slots_win_rate || 0.3) * 100}
                                                onChange={e => updateLocalSetting('slots_win_rate', Number(e.target.value) / 100)}
                                                onMouseUp={e => persistSetting('slots_win_rate', Number(e.target.value) / 100)}
                                                className="flex-1"
                                            />
                                            <span className="text-xs font-bold text-purple-700 w-8">{Math.round((globalSettings.slots_win_rate || 0.3) * 100)}%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Prize Label</label>
                                        <input
                                            type="text"
                                            value={globalSettings.slots_prize_label || '50% OFF'}
                                            onChange={e => updateAndPersist('slots_prize_label', e.target.value)}
                                            className="w-full border border-purple-200 rounded px-2 py-1 text-xs"
                                            placeholder="e.g. 50% OFF"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Prize Code</label>
                                        <input
                                            type="text"
                                            value={globalSettings.slots_prize_code || 'JACKPOT50'}
                                            onChange={e => updateAndPersist('slots_prize_code', e.target.value)}
                                            className="w-full border border-purple-200 rounded px-2 py-1 text-xs font-mono"
                                            placeholder="e.g. JACKPOT50"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Mystery Gift */}
                            <div className="bg-orange-50 p-3 rounded border border-orange-100">
                                <h4 className="font-bold text-sm text-orange-900 mb-2">🎁 Mystery Gift</h4>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-orange-800">Enable Daily Gift?</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={globalSettings.mystery_gift_enabled !== false}
                                            onChange={e => updateAndPersist('mystery_gift_enabled', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                                    </label>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Reward Pool (JSON)</label>
                                    <textarea
                                        value={typeof globalSettings.mystery_gift_pool === 'string' ? globalSettings.mystery_gift_pool : JSON.stringify(globalSettings.mystery_gift_pool || [
                                            { type: 'coupon', value: '10% OFF', code: 'LUCKY10' },
                                            { type: 'shipping', value: 'Free Shipping', code: 'SHIPFREE' }
                                        ])}
                                        onChange={e => updateLocalSetting('mystery_gift_pool', e.target.value)}
                                        onBlur={e => persistSetting('mystery_gift_pool', e.target.value)} // Save on blur to allow typing valid JSON
                                        className="w-full border border-orange-200 rounded px-2 py-1 text-[10px] font-mono h-16"
                                        placeholder='[{"type":"coupon", "value":"10% OFF", "code":"LUCKY10"}]'
                                    />
                                    <p className="text-[9px] text-orange-600 mt-1">*Must be valid JSON array</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'simulator' ? (
                    <SalesSimulator />
                ) : activeTab === 'analytics' ? (
                    <AnalyticsDashboard />
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
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white text-[#0F1111] placeholder-gray-400"
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
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white text-[#0F1111] placeholder-gray-400"
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
                                            className="w-4 h-4 rounded text-primary"
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
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white text-[#0F1111]"
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
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white text-[#0F1111]"
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
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none h-20 bg-white text-[#0F1111] placeholder-gray-400"
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
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
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
                                    className="bg-primary text-white px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"
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
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:opacity-90"
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
                                <button type="submit" disabled={isSubmitting} className="flex-1 bg-primary text-white font-medium py-2 rounded-md shadow-sm active:opacity-80 disabled:opacity-50">
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
