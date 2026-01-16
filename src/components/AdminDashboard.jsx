import { useState, useEffect, useRef } from 'react';
import API_URL from '../config';
import { LayoutDashboard, Package, Truck, CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard = ({ products, onProductUpdate }) => {
    const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders'
    const [newProduct, setNewProduct] = useState({ title: '', price: '', category: '', department: 'Men', description: '', images: [] });
    const [imageFiles, setImageFiles] = useState([]); // Array of File objects
    const [editId, setEditId] = useState(null); // Track if editing
    const fileInputRef = useRef(null);
    const [orders, setOrders] = useState([]);



    useEffect(() => {
        if (activeTab === 'orders') {
            fetchOrders();
        }
    }, [activeTab]);

    const fetchOrders = () => {
        fetch(`${API_URL}/api/orders`)
            .then(res => res.json())
            .then(data => setOrders(data.reverse())); // Newest first
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
        if (!newProduct.title || !newProduct.price) return;

        const formData = new FormData();
        formData.append('title', newProduct.title);
        formData.append('price', newProduct.price);
        formData.append('category', newProduct.category || 'General');
        formData.append('department', newProduct.department || 'Men');
        formData.append('description', newProduct.description || '');


        // Append existing images (as separate fields or array strings)
        // We'll append each one as 'existingImages' field
        if (newProduct.images && newProduct.images.length > 0) {
            newProduct.images.forEach(img => formData.append('existingImages', img));
        }

        // Append new files
        if (imageFiles && imageFiles.length > 0) {
            Array.from(imageFiles).forEach(file => {
                formData.append('images', file);
            });
        }

        if (editId) {
            formData.append('id', editId);
        }

        try {
            const res = await fetch(`${API_URL}/api/products`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Server responded with ${res.status}: ${text.substring(0, 100)}`);
            }

            const data = await res.json();
            if (data.success) {
                onProductUpdate(data.products);
                setNewProduct({ title: '', price: '', category: '', department: 'Men', description: '', images: [] });
                setImageFiles([]);
                setEditId(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            } else {
                alert('Failed to add product: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            console.error(err);
            alert(`Error saving product: ${err.message}`);
        }
    };

    const startEdit = (product) => {
        setNewProduct({
            title: product.title,
            price: product.price,
            category: product.category,
            department: product.department || 'Men',
            description: product.description || '',
            images: product.images || []
        });
        setEditId(product.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setNewProduct({ title: '', price: '', category: '', department: 'Men', description: '', images: [] });
        setImageFiles([]);
        setEditId(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            const res = await fetch(`${API_URL}/api/products/${id}`, { method: 'DELETE' });
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
                headers: { 'Content-Type': 'application/json' },
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
        <div className="bg-white rounded-md shadow-sm border border-gray-200 mt-4 overflow-hidden">
            <div className="bg-[#054D3B] p-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <LayoutDashboard size={24} />
                    Addis Seller Dashboard
                </h2>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50">
                <button
                    onClick={() => setActiveTab('products')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'products' ? 'bg-white border-t-2 border-[#D4AF37] text-[#111827] font-bold' : 'text-gray-500 hover:text-[#111827]'}`}
                >
                    Inventory
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-white border-t-2 border-[#D4AF37] text-[#111827] font-bold' : 'text-gray-500 hover:text-[#111827]'}`}
                >
                    Orders
                </button>
            </div>

            <div className="p-6">
                {activeTab === 'products' ? (
                    <>
                        {/* Add/Edit Form */}
                        <form onSubmit={handleAdd} className="space-y-4 mb-8 bg-gray-50 p-4 rounded border border-gray-200">
                            <h3 className="font-bold text-[#0F1111] border-b pb-2 mb-2">{editId ? 'Edit Product' : 'Add New Product'}</h3>
                            <div>
                                <label className="block text-xs font-bold text-[#0F1111] mb-1">Title</label>
                                <input
                                    value={newProduct.title}
                                    onChange={e => setNewProduct({ ...newProduct, title: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-[#054D3B] focus:ring-1 focus:ring-[#054D3B] outline-none bg-white text-[#0F1111] placeholder-gray-400"
                                    placeholder="Product Name"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#0F1111] mb-1">Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={newProduct.price}
                                        onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-[#054D3B] focus:ring-1 focus:ring-[#054D3B] outline-none bg-white text-[#0F1111] placeholder-gray-400"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#0F1111] mb-1">Department</label>
                                    <select
                                        value={newProduct.department}
                                        onChange={e => setNewProduct({ ...newProduct, department: e.target.value })}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-[#054D3B] focus:ring-1 focus:ring-[#054D3B] outline-none bg-white text-[#0F1111]"
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
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#0F1111] mb-1">Category</label>
                                <input
                                    value={newProduct.category}
                                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-[#054D3B] focus:ring-1 focus:ring-[#054D3B] outline-none bg-white text-[#0F1111] placeholder-gray-400"
                                    placeholder="e.g. Tops, Shoes..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#0F1111] mb-1">Description</label>
                                <textarea
                                    value={newProduct.description}
                                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-[#054D3B] focus:ring-1 focus:ring-[#054D3B] outline-none h-20 bg-white text-[#0F1111] placeholder-gray-400"
                                    placeholder="Product details..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#0F1111] mb-1">Images</label>
                                {/* Active Images List */}
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {newProduct.images && newProduct.images.map((img, idx) => (
                                        <div key={idx} className="relative w-16 h-16 border rounded bg-white flex items-center justify-center">
                                            <img src={img} className="max-w-full max-h-full object-contain" />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(idx)}
                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center hover:bg-red-600"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    ref={fileInputRef}
                                    onChange={e => setImageFiles(e.target.files)}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#F4E08F] file:text-[#054D3B] hover:file:bg-[#D4AF37]"
                                />
                                <p className="text-xs text-gray-500 mt-1">Select one or more files to upload.</p>
                            </div>
                            <div className="flex gap-2 pt-2">
                                {editId && (
                                    <button type="button" onClick={cancelEdit} className="flex-1 bg-white border border-gray-300 text-[#0F1111] font-medium py-2 rounded-md shadow-sm hover:bg-gray-50">
                                        Cancel
                                    </button>
                                )}
                                <button type="submit" className="flex-1 bg-[#D4AF37] border border-[#C5A028] text-[#111827] font-medium py-2 rounded-md shadow-sm hover:bg-[#B59015]">
                                    {editId ? 'Save Changes' : 'Add Product'}
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
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => startEdit(p)} className="text-[#054D3B] hover:underline text-sm font-medium">Edit</button>
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
                                        <div className="font-bold text-[#054D3B]">Order #{order.id}</div>
                                        <div className="text-xs text-gray-500">
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
                                <div className="text-right font-bold text-[#054D3B] mb-3">
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
        </div>
    );
};

export default AdminDashboard;
