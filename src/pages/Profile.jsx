import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { User, Package, MapPin, Heart, Settings, ChevronRight, Gift, MessageCircle, Download, Users } from 'lucide-react';
import ProductList from '../components/ProductList';
import InfiniteScrollTrigger from '../components/InfiniteScrollTrigger';

const Profile = ({ products = [], hasMore, loadMore, isFetching }) => {
    const { user, walletBalance, setInstallGuideVisible, setShowInviteModal } = useStore();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders');

    // Menu Items
    const MENU_ITEMS = [
        { icon: Package, label: "My Orders", path: "/orders" },
        { icon: Heart, label: "Wishlist", path: "/wishlist" },
        { icon: MapPin, label: "Addresses", path: "/addresses" },
        { icon: Gift, label: "Rewards", path: "/rewards" },
        { icon: Users, label: "Invite Friends", action: () => setShowInviteModal(true) },
        { icon: MessageCircle, label: "Support Messages", path: "/support" },
        { icon: Download, label: "Install App", action: () => setInstallGuideVisible(true) },
        { icon: Settings, label: "Settings", path: "/settings" },
    ];

    return (
        <div className="bg-[#f5f5f5] min-h-screen pb-[80px]">
            {/* User Header */}
            <div className="bg-white px-5 pt-8 pb-6 flex items-center gap-4 border-b border-gray-100">
                <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                    {user?.photo_url ? (
                        <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                            <User size={32} />
                        </div>
                    )}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-black">{user?.first_name || "Guest User"}</h2>
                    <p className="text-xs text-gray-500">ID: {user?.id || "N/A"}</p>
                </div>
            </div>

            {/* Wallet / Stats */}
            <div className="bg-white mt-2 px-4 py-6 flex justify-center items-center">
                <div className="text-center">
                    <div className="text-2xl font-bold text-[#fb7701]">{walletBalance || 0}</div>
                    <div className="text-xs text-gray-500 font-medium">Credits (ETB)</div>
                </div>
            </div>



            {/* Menu List */}
            <div className="bg-white mt-2">
                {MENU_ITEMS.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            if (item.path) navigate(item.path);
                            if (item.action) item.action();
                        }}
                        className="w-full flex items-center justify-between px-4 py-4 border-b border-gray-50 active:bg-gray-50"
                    >
                        <div className="flex items-center gap-3 text-gray-700">
                            <item.icon size={20} strokeWidth={1.5} />
                            <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                    </button>
                ))}
            </div>

            {/* Just For You (Infinite Feed) */}
            <div className="mt-4 bg-white px-3 py-4">
                <h3 className="text-sm font-bold mb-3 text-center flex items-center justify-center gap-2">
                    <Heart size={14} className="text-[#fb7701] fill-[#fb7701]" /> Just For You
                </h3>
                <ProductList products={products} />
                <InfiniteScrollTrigger
                    onIntersect={loadMore}
                    isLoading={isFetching}
                    hasMore={hasMore}
                />
            </div>


        </div>
    );
};



export default Profile;
