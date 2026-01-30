import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';
import useStore from '../store/useStore';

const OrdersPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = useStore(state => state.user);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                // Mocking for now if API fails or doesn't exist
                const tele = window.Telegram?.WebApp;
                const res = await fetch(`${API_URL}/api/orders/my`, {
                    headers: {
                        'Authorization': tele?.initData || ''
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setOrders(data.orders || []);
                } else {
                    // console.error("Failed to fetch orders");
                    // Fallback to local storage if API fails (for demo/dev)
                    const localOrders = JSON.parse(localStorage.getItem('my_orders_backup') || '[]');
                    setOrders(localOrders);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return <CheckCircle size={16} className="text-green-500" />;
            case 'cancelled': return <XCircle size={16} className="text-red-500" />;
            case 'shipped': return <Truck size={16} className="text-blue-500" />;
            default: return <Clock size={16} className="text-orange-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f5f5] pb-10 font-sans pt-[var(--tg-content-safe-area-top)]">
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center shadow-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="p-1 -ml-1 text-gray-700 active:opacity-60"
                >
                    <ArrowLeft size={22} />
                </button>
                <div className="flex-1 text-center pr-6">
                    <h1 className="text-lg font-bold text-black">My Orders</h1>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center pt-20 px-6 text-center">
                    <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                        <Package size={40} className="text-gray-300" />
                    </div>
                    <h2 className="text-base font-bold text-gray-900 mb-1">No orders yet</h2>
                    <p className="text-gray-500 text-sm mb-6">Looks like you haven't placed an order yet.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-[#fb7701] text-white px-8 py-3 rounded-full font-bold shadow-lg"
                    >
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div className="p-3 space-y-3">
                    {orders.map((order, i) => (
                        <div key={order._id || i} className="bg-white p-4 rounded-xl shadow-sm">
                            <div className="flex justify-between items-start mb-3 border-b border-gray-50 pb-2">
                                <div>
                                    <p className="text-xs text-gray-400 font-mono">Order #{order._id?.slice(-6) || '---'}</p>
                                    <p className="text-[10px] text-gray-300">
                                        {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 text-xs font-bold capitalize">
                                    {getStatusIcon(order.status)}
                                    <span>{order.status || 'Processing'}</span>
                                </div>
                            </div>

                            <div className="space-y-2 mb-3">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex gap-3">
                                        <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                            {item.images?.[0] && <img src={item.images[0]} className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-medium line-clamp-1">{item.title}</p>
                                            <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                                <span className="text-xs text-gray-500">Total Amount</span>
                                <span className="text-sm font-bold text-[#fb7701]">ETB {order.total_price}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
