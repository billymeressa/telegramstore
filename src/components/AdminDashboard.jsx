import { useState, useEffect, useRef } from 'react';
import API_URL from '../config';
import SalesSimulator from './SalesSimulator';
import AnalyticsDashboard from '../pages/AnalyticsDashboard';
import { Package, ShoppingBag, Settings, Activity, BarChart2, Plus, Trash2, Edit2, Image as ImageIcon, Save, X, Users, Bell, Gift } from 'lucide-react';

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
    const [activeTab, setActiveTab] = useState('products');
    const [newProduct, setNewProduct] = useState({ title: '', price: '', stock: 1, isUnique: true, stockStatus: 'Distinct', category: '', department: 'Men', description: '', images: [], variations: [] });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mainImageFile, setMainImageFile] = useState(null);
    const [additionalImageFiles, setAdditionalImageFiles] = useState([]);
    const [editId, setEditId] = useState(null);
    const fileInputRef = useRef(null);
    const [orders, setOrders] = useState([]);
    const [variationType, setVariationType] = useState('');
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
            if (!data.success) {
                alert('Failed to save: ' + data.error);
            }
        } catch (err) {
            console.error(err);
            alert('Error saving setting');
        }
    };

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
        if (!API_URL) return;
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

        if (newProduct.images && newProduct.images.length > 0) {
            newProduct.images.forEach(img => formData.append('existingImages', img));
        }
        if (mainImageFile) formData.append('images', mainImageFile);
        if (additionalImageFiles && additionalImageFiles.length > 0) {
            Array.from(additionalImageFiles).forEach(file => formData.append('images', file));
        }
        if (newProduct.variations && newProduct.variations.length > 0) {
            formData.append('variations', JSON.stringify(newProduct.variations));
        }
        if (editId) formData.append('id', editId);

        try {
            const url = `${API_URL}/api/products`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Authorization': tele?.initData || '' },
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                onProductUpdate(data.products);
                setNewProduct({ title: '', price: '', stock: 1, isUnique: true, stockStatus: 'Distinct', category: '', department: 'Men', description: '', images: [], variations: [] });
                setMainImageFile(null);
                setAdditionalImageFiles([]);
                setEditId(null);
                alert('Product Saved Successfully!');
            } else {
                alert('Failed: ' + data.error);
            }
        } catch (err) {
            console.error(err);
            alert('Error saving product');
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
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            const res = await fetch(`${API_URL}/api/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': tele?.initData || '' }
            });
            const data = await res.json();
            if (data.success) {
                onProductUpdate(data.products);
            } else {
                alert('Failed to delete');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': tele?.initData || '' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (data.success) fetchOrders();
        } catch (err) {
            console.error(err);
        }
    };

    const Tabs = [
        { id: 'products', label: 'Inventory', icon: Package },
        { id: 'orders', label: 'Orders', icon: ShoppingBag },
        { id: 'settings', label: 'Engine', icon: Settings },
        { id: 'simulator', label: 'Simulator', icon: Activity },
        { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    ];

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Settings className="text-[#fb7701]" /> Addis Admin
                </h2>
                <div className="text-xs text-gray-500">v2.0 Pro</div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-gray-200 px-6 flex gap-6 overflow-x-auto no-scrollbar">
                {Tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 py-4 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                            ? 'border-[#fb7701] text-[#fb7701]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="p-6 max-w-6xl mx-auto">

                {/* SETTINGS ENGINE */}
                {activeTab === 'settings' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Activity className="text-[#fb7701]" size={20} />
                                Automated Sales Engine
                            </h3>

                            {/* Live Notifications Control (New) */}
                            <div className="mb-8 border-b border-gray-100 pb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                        <div className="bg-orange-100 p-1 rounded text-[#fb7701]">
                                            <Bell size={14} />
                                        </div>
                                        Live Notifications System
                                    </h4>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox text-[#fb7701] rounded focus:ring-orange-500"
                                            checked={globalSettings.notifications_enabled !== false}
                                            onChange={(e) => updateAndPersist('notifications_enabled', e.target.checked)}
                                        />
                                        <span className="text-xs font-medium text-gray-600">Enabled</span>
                                    </label>
                                </div>

                                {globalSettings.notifications_enabled !== false && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-2">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 mb-1 block">Frequency (Seconds)</label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="range"
                                                    min="10" max="600" step="10"
                                                    className="w-full accent-[#fb7701]"
                                                    value={globalSettings.notification_frequency || 60}
                                                    onChange={(e) => updateLocalSetting('notification_frequency', parseInt(e.target.value))}
                                                    onMouseUp={(e) => persistSetting('notification_frequency', parseInt(e.target.value))}
                                                />
                                                <span className="text-xs font-mono font-bold w-10 text-right">
                                                    {globalSettings.notification_frequency || 60}s
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="form-checkbox text-[#fb7701] rounded"
                                                    checked={globalSettings.notification_spin_wins !== false}
                                                    onChange={(e) => updateAndPersist('notification_spin_wins', e.target.checked)}
                                                />
                                                <span className="text-xs text-gray-600">Show Spin Winners</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="form-checkbox text-[#fb7701] rounded"
                                                    checked={globalSettings.notification_purchases !== false}
                                                    onChange={(e) => updateAndPersist('notification_purchases', e.target.checked)}
                                                />
                                                <span className="text-xs text-gray-600">Show Recent Purchases</span>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sale Intensity */}
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Global Sale Intensity</h4>
                                <div className="flex gap-2">
                                    {['low', 'medium', 'high'].map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => updateAndPersist('global_sale_intensity', level)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize border ${globalSettings.global_sale_intensity === level
                                                ? 'bg-[#fff0e0] border-[#fb7701] text-[#fb7701]'
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sliders Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Flash Sale Probability</h4>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            className="w-full accent-[#fb7701]"
                                            value={(globalSettings.system_flash_sale_prob || 0.2) * 100}
                                            onChange={(e) => updateLocalSetting('system_flash_sale_prob', parseFloat(e.target.value) / 100)}
                                            onMouseUp={(e) => persistSetting('system_flash_sale_prob', parseFloat(e.target.value) / 100)}
                                        />
                                        <span className="text-sm font-mono font-bold w-12 text-right">{Math.round((globalSettings.system_flash_sale_prob || 0.2) * 100)}%</span>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Social Proof Multiplier</h4>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            step="0.1"
                                            className="w-full accent-[#fb7701]"
                                            value={globalSettings.system_social_proof_mult || 1.5}
                                            onChange={(e) => updateLocalSetting('system_social_proof_mult', parseFloat(e.target.value))}
                                            onMouseUp={(e) => persistSetting('system_social_proof_mult', parseFloat(e.target.value))}
                                        />
                                        <span className="text-sm font-mono font-bold w-12 text-right">{globalSettings.system_social_proof_mult || 1.5}x</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* GAMIFICATION */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Gift className="text-purple-600" size={20} />
                                Gamification & Rewards
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h5 className="text-sm font-bold text-gray-900 mb-2">Slot Machine</h5>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="rounded text-purple-600"
                                                checked={globalSettings.enable_slots_popup !== false}
                                                onChange={e => updateAndPersist('enable_slots_popup', e.target.checked)}
                                            />
                                            <span className="text-xs font-medium">Auto-Popup Enabled</span>
                                        </label>

                                        <div>
                                            <label className="text-xs text-gray-500">Popup Frequency (Hours)</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="w-full border rounded px-2 py-1 text-sm"
                                                    placeholder="24"
                                                    value={globalSettings.slots_popup_frequency ?? 24}
                                                    onChange={e => updateLocalSetting('slots_popup_frequency', parseFloat(e.target.value))}
                                                    onBlur={e => persistSetting('slots_popup_frequency', parseFloat(e.target.value))}
                                                />
                                                <span className="text-xs text-gray-400">0=Always</span>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-gray-100">
                                            <label className="text-xs text-gray-500">Win Rate</label>
                                            <input
                                                type="range"
                                                min="0" max="100" step="5"
                                                className="w-full accent-purple-600"
                                                value={(globalSettings.slots_win_rate || 0.3) * 100}
                                                onChange={e => updateLocalSetting('slots_win_rate', Number(e.target.value) / 100)}
                                                onMouseUp={e => persistSetting('slots_win_rate', Number(e.target.value) / 100)}
                                            />
                                            <div className="text-xs text-right font-bold">{Math.round((globalSettings.slots_win_rate || 0.3) * 100)}%</div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                className="border rounded px-2 py-1 text-sm"
                                                placeholder="Prize Label"
                                                value={globalSettings.slots_prize_label || '50 ETB Credit'}
                                                onChange={e => updateAndPersist('slots_prize_label', e.target.value)}
                                            />
                                            <input
                                                className="border rounded px-2 py-1 text-sm"
                                                placeholder="Code"
                                                value={globalSettings.slots_prize_code || 'CREDIT50'}
                                                onChange={e => updateAndPersist('slots_prize_code', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h5 className="text-sm font-bold text-gray-900 mb-2">Mystery Gift</h5>
                                    <label className="flex items-center gap-2 mb-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="rounded text-purple-600"
                                            checked={globalSettings.mystery_gift_enabled !== false}
                                            onChange={e => updateAndPersist('mystery_gift_enabled', e.target.checked)}
                                        />
                                        <span className="text-sm">Enable Daily Gift</span>
                                    </label>
                                    <textarea
                                        className="w-full border rounded p-2 text-xs font-mono h-20"
                                        placeholder="JSON Rewards Pool"
                                        value={typeof globalSettings.mystery_gift_pool === 'string' ? globalSettings.mystery_gift_pool : JSON.stringify(globalSettings.mystery_gift_pool || [{ type: 'credit', value: '10', label: '10 ETB Credit' }])}
                                        onChange={e => updateLocalSetting('mystery_gift_pool', e.target.value)}
                                        onBlur={e => persistSetting('mystery_gift_pool', e.target.value)}
                                    />
                                </div>


                                {/* Referral Program */}
                                <div className="mt-6 pt-6 border-t border-gray-100 col-span-1 md:col-span-2">
                                    <h5 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                        <Users className="text-blue-500" size={16} /> Referral Program
                                    </h5>
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="rounded text-blue-600"
                                                checked={globalSettings.referral_enabled !== false}
                                                onChange={e => updateAndPersist('referral_enabled', e.target.checked)}
                                            />
                                            <span className="text-sm font-medium">Enable Invite System</span>
                                        </label>

                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500">Reward per Invite (ETB):</span>
                                            <input
                                                type="number"
                                                min="0"
                                                className="border rounded px-2 py-1 text-sm w-24"
                                                value={globalSettings.referral_reward_amount || 50}
                                                onChange={e => updateLocalSetting('referral_reward_amount', parseFloat(e.target.value))}
                                                onBlur={e => persistSetting('referral_reward_amount', parseFloat(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>


                            {/* SAVE BUTTON */}
                            <div className="flex justify-end pt-4 pb-8">
                                <button
                                    onClick={() => {
                                        // Save all relevant settings in batch
                                        Object.entries(globalSettings).forEach(([key, value]) => {
                                            persistSetting(key, value);
                                        });
                                        alert("All configurations saved successfully!");
                                    }}
                                    className="flex items-center gap-2 bg-[#fb7701] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#e06900] transition-all shadow-lg hover:shadow-xl active:scale-95"
                                >
                                    <Save size={20} />
                                    Save Configurations
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* SIMULATOR */}
                {activeTab === 'simulator' && <SalesSimulator />}

                {/* ANALYTICS */}
                {activeTab === 'analytics' && <AnalyticsDashboard />}

                {/* PRODUCTS (INVENTORY) */}
                {activeTab === 'products' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
                        {/* Form Column */}
                        <div className="lg:col-span-1">
                            <form onSubmit={handleAdd} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-24">
                                <h3 className="font-bold text-gray-800 mb-4">{editId ? 'Edit Product' : 'Add New Product'}</h3>

                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                                        <input className="w-full border border-gray-300 rounded-lg p-2 text-sm" value={newProduct.title} onChange={e => setNewProduct({ ...newProduct, title: e.target.value })} required />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Price</label>
                                            <input type="number" step="0.01" className="w-full border border-gray-300 rounded-lg p-2 text-sm" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Stock</label>
                                            <input type="number" className="w-full border border-gray-300 rounded-lg p-2 text-sm" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <select className="border border-gray-300 rounded-lg p-2 text-sm" value={newProduct.department} onChange={e => setNewProduct({ ...newProduct, department: e.target.value })}>
                                                {Object.keys(SUBCATEGORIES).map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                            <select className="border border-gray-300 rounded-lg p-2 text-sm" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                                                <option value="">Sub-Category</option>
                                                {(SUBCATEGORIES[newProduct.department] || []).map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 cursor-pointer py-2">
                                            <input type="checkbox" checked={newProduct.isUnique} onChange={e => setNewProduct({ ...newProduct, isUnique: e.target.checked })} />
                                            <span className="text-sm font-medium">Unique Item (One-of-a-kind)</span>
                                        </label>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Images</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <label className="flex-1 cursor-pointer bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3 flex flex-col items-center justify-center hover:bg-gray-100 transition-colors">
                                                <ImageIcon size={20} className="text-gray-400 mb-1" />
                                                <span className="text-xs text-gray-500">Main Image</span>
                                                <input type="file" className="hidden" onChange={e => setMainImageFile(e.target.files[0])} />
                                            </label>
                                            {mainImageFile && <div className="text-xs text-green-600 font-bold">Selected</div>}
                                        </div>
                                    </div>

                                    <div className="pt-2 flex gap-2">
                                        <button type="submit" disabled={isSubmitting} className="flex-1 bg-[#fb7701] text-white py-2 rounded-lg font-bold text-sm hover:bg-[#e06900] transition-colors shadow-sm">
                                            {isSubmitting ? 'Saving...' : (editId ? 'Update Product' : 'Add Product')}
                                        </button>
                                        {editId && (
                                            <button type="button" onClick={cancelEdit} className="bg-gray-200 text-gray-700 px-3 rounded-lg font-bold text-sm hover:bg-gray-300">
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* List Column */}
                        <div className="lg:col-span-2 space-y-3">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-gray-700">{products.length} Products</h3>
                            </div>

                            {products.map(p => (
                                <div key={p.id} className="bg-white rounded-lg border border-gray-200 p-3 flex items-center justify-between hover:shadow-sm transition-shadow">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                            {p.images && p.images[0] ? (
                                                <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={16} /></div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-gray-900">{p.title}</div>
                                            <div className="text-xs text-gray-500">
                                                {p.price} ETB • {p.stock} units
                                                {p.isUnique && <span className="ml-2 text-purple-600 font-bold bg-purple-50 px-1 rounded">Unique</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button onClick={() => startEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ORDERS */}
                {activeTab === 'orders' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {orders.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No orders found.</div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {orders.map(order => (
                                    <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-sm text-[#fb7701]">Order #{order.id}</h4>
                                                <div className="text-xs text-gray-500">{new Date(order.createdAt || Date.now()).toLocaleDateString()}</div>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                order.status === 'sold' ? 'bg-green-100 text-green-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className="text-sm font-bold mb-3 flex justify-between">
                                            <span>{order.items?.length || 0} Items</span>
                                            <span>{Math.floor(order.total_price)} ETB</span>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleUpdateStatus(order.id, 'sold')}
                                                className="flex-1 bg-green-50 text-green-700 border border-green-200 py-1.5 rounded text-xs font-bold hover:bg-green-100"
                                            >
                                                Mark Sold
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                                className="flex-1 bg-red-50 text-red-700 border border-red-200 py-1.5 rounded text-xs font-bold hover:bg-red-100"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
};



export default AdminDashboard;
