import { useState, useEffect } from 'react';
import API_URL from '../config';
import { Package, Clock, CheckCircle, Truck, XCircle, Settings, Heart, BarChart3 } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import SpinWheel from '../components/SpinWheel';
import useStore from '../store/useStore';
import { Wallet, Coins } from 'lucide-react';


const tele = window.Telegram?.WebApp;

const Profile = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isAdmin, isSuperAdmin, user } = useOutletContext();
    const navigate = useNavigate();

    // Store data
    const walletBalance = useStore(state => state.walletBalance);
    const checkInStreak = useStore(state => state.checkInStreak);
    const fetchUserData = useStore(state => state.fetchUserData);

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
            case 'shipped': return <Truck size={16} className="text-[var(--tg-theme-link-color)]" />;
            case 'delivered': return <CheckCircle size={16} className="text-[var(--tg-theme-button-color)]" />;
            case 'cancelled': return <XCircle size={16} className="text-red-500" />;
            default: return <Package size={16} className="text-gray-500" />;
        }
    };

    return (
        <div className="bg-gray-50 min-h-dvh pb-24 font-sans pt-[var(--tg-content-safe-area-top)]">
            {/* Header / User Info */}
            <div className="bg-white p-6 border-b border-gray-100 mb-2">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold text-gray-400 uppercase overflow-hidden border-2 border-white shadow-md">
                        {user?.photo_url ? (
                            <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            user?.first_name?.charAt(0) || 'U'
                        )}
                    </div>
                    <div>
                        <h2 className="font-bold text-xl text-gray-900">Hello, {user?.first_name || 'Guest'}</h2>
                        <p className="text-gray-500 text-sm">@{user?.username || 'user'}</p>
                    </div>
                </div>
            </div>

            <div className="px-3 space-y-4">
                {/* Wallet & Rewards Card */}
                <div className="bg-gradient-to-br from-primary to-orange-600 rounded-2xl p-5 text-white shadow-lg shadow-orange-500/20 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">Total Balance</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-4xl font-black">{walletBalance || 0}</span>
                                    <span className="text-sm font-bold opacity-80 uppercase bg-white/20 px-1.5 py-0.5 rounded">ETB</span>
                                </div>
                            </div>
                            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                <Wallet size={20} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-black/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                                <div className="flex items-center gap-2 mb-1">
                                    <Coins size={14} className="text-yellow-300" />
                                    <span className="text-[10px] font-bold uppercase opacity-80">Daily Streak</span>
                                </div>
                                <p className="text-lg font-bold">{checkInStreak || 0} Days</p>
                            </div>
                            <div className="bg-black/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">🎡</span>
                                    <span className="text-[10px] font-bold uppercase opacity-80">Free Spins</span>
                                </div>
                                <p className="text-lg font-bold">1 Available</p>
                            </div>
                        </div>
                    </div>
                    {/* Decorative Background */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/10 to-transparent"></div>
                </div>

                {/* Spin Wheel Section */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                    <SpinWheel />
                </div>

                {/* Menu List */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 divide-y divide-gray-50">
                    {/* Wishlist Button */}
                    <button
                        onClick={() => navigate('/wishlist')}
                        className="w-full bg-white p-4 flex items-center justify-between active:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                                <Heart size={16} className="text-red-500" />
                            </div>
                            <span className="text-gray-700 font-medium text-sm">Your Wishlist</span>
                        </div>
                        <span className="text-gray-300 text-lg">›</span>
                    </button>

                    {/* Admin Access Button */}
                    {isAdmin && (
                        <button
                            onClick={() => navigate('/admin')}
                            className="w-full bg-white p-4 flex items-center justify-between active:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                    <Settings size={16} className="text-blue-600" />
                                </div>
                                <span className="text-gray-700 font-medium text-sm">Seller Dashboard</span>
                            </div>
                            <span className="text-gray-300 text-lg">›</span>
                        </button>
                    )}

                    {/* Analytics Button - Super Admin Only */}
                    {isSuperAdmin && (
                        <button
                            onClick={() => navigate('/analytics')}
                            className="w-full bg-white p-4 flex items-center justify-between active:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                                    <BarChart3 size={16} className="text-purple-600" />
                                </div>
                                <span className="text-gray-700 font-medium text-sm">Analytics</span>
                            </div>
                            <span className="text-gray-300 text-lg">›</span>
                        </button>
                    )}
                </div>

                {/* Order History */}
                <div>
                    <h3 className="font-bold text-lg mb-3 text-gray-900 px-1">Your Orders</h3>

                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading orders...</div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12 bg-white border border-gray-200 rounded-xl shadow-sm">
                            <Package size={48} className="mx-auto text-gray-200 mb-3" />
                            <p className="text-gray-500 font-medium">You have no orders yet.</p>
                            <button className="mt-4 text-primary text-sm font-semibold hover:underline" onClick={() => navigate('/')}>Start shopping</button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {orders.map(order => (
                                <div key={order.id} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden active:scale-[0.99] transition-transform">
                                    <div className="bg-gray-50/50 p-3 border-b border-gray-100 flex justify-between text-xs text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">#{order.id}</span>
                                            <span>•</span>
                                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-primary font-bold">{Math.floor(order.total_price)} Birr</div>
                                    </div>

                                    <div className="p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="font-bold text-gray-800 capitalize text-sm flex items-center gap-2 bg-gray-50 px-2 py-1 rounded">
                                                {getStatusIcon(order.status)}
                                                {order.status}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm text-gray-600">
                                                    <span className="truncate max-w-[200px]">{item.quantity}x {item.title}</span>
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
