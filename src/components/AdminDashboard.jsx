import { useState, useEffect, useRef } from 'react';
import API_URL from '../config';
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

    return (
        <div>
            <h2>Addis Seller Dashboard</h2>

            <div>
                <button onClick={() => setActiveTab('products')} style={{ fontWeight: activeTab === 'products' ? 'bold' : 'normal' }}>Inventory</button>
                <button onClick={() => setActiveTab('orders')} style={{ fontWeight: activeTab === 'orders' ? 'bold' : 'normal' }}>Orders</button>
                <button onClick={() => setActiveTab('settings')} style={{ fontWeight: activeTab === 'settings' ? 'bold' : 'normal' }}>Engine</button>
                <button onClick={() => setActiveTab('simulator')} style={{ fontWeight: activeTab === 'simulator' ? 'bold' : 'normal' }}>Simulator</button>
                <button onClick={() => setActiveTab('analytics')} style={{ fontWeight: activeTab === 'analytics' ? 'bold' : 'normal' }}>Analytics</button>
            </div>

            <hr />

            <div>
                {activeTab === 'settings' ? (
                    <div>
                        <h3>Automated Sales & Promotion Engine</h3>
                        <div>
                            <h4>Global Sale Intensity</h4>
                            {['low', 'medium', 'high'].map((level) => (
                                <button key={level} onClick={() => updateAndPersist('global_sale_intensity', level)}>
                                    {level} {globalSettings.global_sale_intensity === level && '(Selected)'}
                                </button>
                            ))}
                        </div>
                        <br />
                        <div>
                            <h4>Automatic Discount Range</h4>
                            <label>Min % <input type="number" value={(globalSettings.system_discount_min || 0.15) * 100} onChange={(e) => updateAndPersist('system_discount_min', parseFloat(e.target.value) / 100)} /></label>
                            <label>Max % <input type="number" value={(globalSettings.system_discount_max || 0.35) * 100} onChange={(e) => updateAndPersist('system_discount_max', parseFloat(e.target.value) / 100)} /></label>
                        </div>
                        <br />
                        <div>
                            <h4>Flash Sale Frequency</h4>
                            <input type="range" min="0" max="100" value={(globalSettings.system_flash_sale_prob || 0.2) * 100} onChange={(e) => updateLocalSetting('system_flash_sale_prob', parseFloat(e.target.value) / 100)} onMouseUp={(e) => persistSetting('system_flash_sale_prob', parseFloat(e.target.value) / 100)} />
                            <span>{Math.round((globalSettings.system_flash_sale_prob || 0.2) * 100)}%</span>
                        </div>
                        <br />
                        <div>
                            <h4>Social Proof Multiplier</h4>
                            <input type="range" min="1" max="10" step="0.1" value={globalSettings.system_social_proof_mult || 1.5} onChange={(e) => updateLocalSetting('system_social_proof_mult', parseFloat(e.target.value))} onMouseUp={(e) => persistSetting('system_social_proof_mult', parseFloat(e.target.value))} />
                            <span>{globalSettings.system_social_proof_mult || 1.5}x</span>
                        </div>
                        <br />
                        <div>
                            <h4>Home Screen Banners</h4>
                            <div>
                                {(globalSettings.home_banners || []).map((b, idx) => (
                                    <div key={idx}>
                                        <b>{b.title}</b> - {b.description} <button onClick={() => removeBanner(idx)}>Remove</button>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <input placeholder="Title" value={newBanner.title} onChange={e => setNewBanner({ ...newBanner, title: e.target.value })} />
                                <input placeholder="Description" value={newBanner.description} onChange={e => setNewBanner({ ...newBanner, description: e.target.value })} />
                                <input placeholder="Button Text" value={newBanner.buttonText} onChange={e => setNewBanner({ ...newBanner, buttonText: e.target.value })} />
                                <select value={newBanner.gradient} onChange={e => setNewBanner({ ...newBanner, gradient: e.target.value })}>
                                    {GRADIENTS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                                </select>
                                <button onClick={addBanner}>+ Add Banner</button>
                            </div>
                        </div>
                        <br />
                        <div>
                            <h4>Gamification & Rewards</h4>
                            <div>
                                <h5>Slot Machine</h5>
                                <label>Win Probability: <input type="range" min="0" max="100" step="5" value={(globalSettings.slots_win_rate || 0.3) * 100} onChange={e => updateLocalSetting('slots_win_rate', Number(e.target.value) / 100)} onMouseUp={e => persistSetting('slots_win_rate', Number(e.target.value) / 100)} /> {Math.round((globalSettings.slots_win_rate || 0.3) * 100)}%</label>
                                <br />
                                <label>Prize Label: <input value={globalSettings.slots_prize_label || '50% OFF'} onChange={e => updateAndPersist('slots_prize_label', e.target.value)} /></label>
                                <br />
                                <label>Prize Code: <input value={globalSettings.slots_prize_code || 'JACKPOT50'} onChange={e => updateAndPersist('slots_prize_code', e.target.value)} /></label>
                            </div>
                            <br />
                            <div>
                                <h5>Mystery Gift</h5>
                                <label><input type="checkbox" checked={globalSettings.mystery_gift_enabled !== false} onChange={e => updateAndPersist('mystery_gift_enabled', e.target.checked)} /> Enable Daily Gift</label>
                                <br />
                                <label>Reward Pool (JSON): <textarea value={typeof globalSettings.mystery_gift_pool === 'string' ? globalSettings.mystery_gift_pool : JSON.stringify(globalSettings.mystery_gift_pool || [{ type: 'coupon', value: '10% OFF', code: 'LUCKY10' }])} onChange={e => updateLocalSetting('mystery_gift_pool', e.target.value)} onBlur={e => persistSetting('mystery_gift_pool', e.target.value)} /></label>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'simulator' ? (
                    <SalesSimulator />
                ) : activeTab === 'analytics' ? (
                    <AnalyticsDashboard />
                ) : activeTab === 'products' ? (
                    <>
                        <form onSubmit={handleAdd}>
                            <h3>{editId ? 'Edit Product' : 'Add New Product'}</h3>
                            <div><label>Title <input value={newProduct.title} onChange={e => setNewProduct({ ...newProduct, title: e.target.value })} /></label></div>
                            <div><label>Price <input type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} /></label></div>
                            <div><label>Stock <input type="number" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} /></label></div>
                            <div><label><input type="checkbox" checked={newProduct.isUnique} onChange={e => setNewProduct({ ...newProduct, isUnique: e.target.checked })} /> One of a Kind?</label></div>
                            <div><label>Category <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                                <option value="">Select</option>
                                {(SUBCATEGORIES[newProduct.department] || []).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select></label></div>
                            <div><label>Description <textarea value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} /></label></div>

                            <div>
                                <label>Images: <input type="file" onChange={e => setMainImageFile(e.target.files[0])} /></label>
                                {mainImageFile && <span>Selected</span>}
                            </div>

                            <button type="submit">{editId ? 'Save' : 'Add'}</button>
                            {editId && <button type="button" onClick={cancelEdit}>Cancel</button>}
                        </form>

                        <hr />

                        <div>
                            {products.map(p => (
                                <div key={p.id}>
                                    <hr />
                                    <b>{p.title}</b> - {p.price} Birr
                                    <button onClick={() => startEdit(p)}>Edit</button>
                                    <button onClick={() => handleDelete(p.id)}>Delete</button>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div>
                        {orders.map(order => (
                            <div key={order.id}>
                                <hr />
                                <b>Order #{order.id}</b> - {order.status}
                                <div>Total: {order.total_price}</div>
                                <button onClick={() => handleUpdateStatus(order.id, 'sold')}>Mark Sold</button>
                                <button onClick={() => handleUpdateStatus(order.id, 'cancelled')}>Cancel</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
