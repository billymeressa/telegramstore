import { useState, useEffect } from 'react';
import API_URL from '../config';
import { Package, Clock, CheckCircle, Truck, XCircle, Settings } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

const tele = window.Telegram?.WebApp;

const Profile = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isAdmin, user } = useOutletContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.id) {
            fetch(`${API_URL}/api/orders?userId=${user.id}`)
                .then(res => res.json())
                .then(data => {
                    // Sort by newest first
                    const sorted = data.sort((a, b) => b.id - a.id);
                    setOrders(sorted);
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user?.id]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock size={16} className="text-yellow-500" />;
            case 'shipped': return <Truck size={16} className="text-blue-500" />;
            case 'delivered': return <CheckCircle size={16} className="text-green-500" />;
            case 'cancelled': return <XCircle size={16} className="text-red-500" />;
            default: return <Package size={16} className="text-gray-500" />;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-4">
            {/* Header / User Info */}
            <div className="bg-white p-4 border-b border-gray-200 mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-400 uppercase border border-gray-300">
                        {user?.first_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <h2 className="font-bold text-xl text-[#111827]">Hello, {user?.first_name || 'Guest'}</h2>
                        <p className="text-gray-500 text-sm">@{user?.username || 'user'}</p>
                    </div>
                </div>
            </div>

            <div className="px-4 space-y-4">
                {/* Admin Access Button */}
                {isAdmin && (
                    <button
                        onClick={() => navigate('/admin')}
                        className="w-full bg-white border border-gray-300 p-4 rounded-lg flex items-center justify-between shadow-sm active:bg-gray-100 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Settings size={20} className="text-[#111827]" />
                            <span className="text-[#111827] font-medium">Seller Dashboard</span>
                        </div>
                        <span className="text-gray-400">→</span>
                    </button>
                )}

                {/* Order History */}
                <div>
                    <h3 className="font-bold text-lg mb-3 text-[#111827]">Your Orders</h3>

                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading orders...</div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg shadow-sm">
                            <Package size={48} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500">You have no orders yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map(order => (
                                <div key={order.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                    <div className="bg-gray-50 p-3 border-b border-gray-100 flex justify-between text-xs text-gray-500">
                                        <div>
                                            <div className="uppercase">Order Placed</div>
                                            <div className="text-gray-700 font-medium">{new Date(order.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="uppercase">Total</div>
                                            <div className="text-[#054D3B] font-bold">{Math.floor(order.total_price)} Birr</div>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="font-bold text-[#111827] capitalize text-lg flex items-center gap-2">
                                                {getStatusIcon(order.status)}
                                                {order.status}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span className="text-[#054D3B] hover:underline cursor-pointer">{item.quantity}x {item.title}</span>

                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
