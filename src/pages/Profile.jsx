import { useState, useEffect } from 'react';
import API_URL from '../config';
import { Package, Clock, CheckCircle, Truck, XCircle, Settings, Heart, BarChart3 } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import SpinWheel from '../components/SpinWheel';
import useStore from '../store/useStore';
import { Wallet, Coins } from 'lucide-react';
import NativeHeader from '../components/NativeHeader';

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
        <div className="bg-[var(--tg-theme-secondary-bg-color)] min-h-dvh pb-24 font-sans pt-[calc(var(--tg-content-safe-area-top)+44px)]">
            <NativeHeader title="Profile" />
            {/* Header / User Info */}
            <div className="bg-[var(--tg-theme-bg-color)] p-4 border-b border-[var(--tg-theme-section-separator-color)] mb-2">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[var(--tg-theme-secondary-bg-color)] rounded-full flex items-center justify-center text-2xl font-bold text-[var(--tg-theme-hint-color)] uppercase overflow-hidden">
                        {user?.photo_url ? (
                            <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            user?.first_name?.charAt(0) || 'U'
                        )}
                    </div>
                    <div>
                        <h2 className="font-semibold text-lg text-[var(--tg-theme-text-color)]">Hello, {user?.first_name || 'Guest'}</h2>
                        <p className="text-[var(--tg-theme-hint-color)] text-sm">@{user?.username || 'user'}</p>
                    </div>
                </div>
            </div>

            <div className="px-3 space-y-4">
                {/* Wallet & Rewards Card */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl p-5 text-white shadow-lg">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-blue-100 text-xs font-medium uppercase tracking-wider mb-1">Total Balance</p>
                            <div className="flex items-center gap-2">
                                <span className="text-3xl font-black">{walletBalance || 0}</span>
                                <span className="text-sm font-bold opacity-80 uppercase">ETB</span>
                            </div>
                        </div>
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                            <Wallet size={24} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <Coins size={14} className="text-yellow-300" />
                                <span className="text-[10px] font-bold uppercase opacity-80">Daily Streak</span>
                            </div>
                            <p className="text-lg font-bold">{checkInStreak || 0} Days</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">🎡</span>
                                <span className="text-[10px] font-bold uppercase opacity-80">Free Spins</span>
                            </div>
                            <p className="text-lg font-bold">1 Available</p>
                        </div>
                    </div>
                </div>

                {/* Spin Wheel Section */}
                <div className="bg-[var(--tg-theme-bg-color)] rounded-2xl overflow-hidden shadow-sm border border-[var(--tg-theme-section-separator-color)]">
                    <SpinWheel />
                </div>
                {/* Admin Access Button */}
                {isAdmin && (
                    <>
                        <button
                            onClick={() => navigate('/admin')}
                            className="w-full bg-[var(--tg-theme-bg-color)] p-3 rounded-xl flex items-center justify-between active:bg-[var(--tg-theme-secondary-bg-color)] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Settings size={18} className="text-blue-600" />
                                </div>
                                <span className="text-[var(--tg-theme-text-color)] font-medium text-sm">Seller Dashboard</span>
                            </div>
                            <span className="text-[var(--tg-theme-hint-color)] text-lg">›</span>
                        </button>
                    </>
                )}

                {/* Analytics Button - Super Admin Only */}
                {isSuperAdmin && (
                    <button
                        onClick={() => navigate('/analytics')}
                        className="w-full bg-[var(--tg-theme-bg-color)] p-3 rounded-xl flex items-center justify-between active:bg-[var(--tg-theme-secondary-bg-color)] transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                <BarChart3 size={18} className="text-purple-600" />
                            </div>
                            <span className="text-[var(--tg-theme-text-color)] font-medium text-sm">Analytics</span>
                        </div>
                        <span className="text-[var(--tg-theme-hint-color)] text-lg">›</span>
                    </button>
                )}

                {/* Wishlist Button */}
                <button
                    onClick={() => navigate('/wishlist')}
                    className="w-full bg-[var(--tg-theme-bg-color)] p-3 rounded-xl flex items-center justify-between active:bg-[var(--tg-theme-secondary-bg-color)] transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                            <Heart size={18} className="text-red-500" />
                        </div>
                        <span className="text-[var(--tg-theme-text-color)] font-medium text-sm">Your Wishlist</span>
                    </div>
                    <span className="text-[var(--tg-theme-hint-color)] text-lg">›</span>
                </button>

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
                                            <div className="text-[var(--tg-theme-button-color)] font-bold">{Math.floor(order.total_price)} Birr</div>
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
                                                    <span className="text-[var(--tg-theme-text-color)] hover:underline cursor-pointer">{item.quantity}x {item.title}</span>

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
