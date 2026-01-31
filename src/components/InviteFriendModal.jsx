import React from 'react';
import { X, Share2, Copy, Users } from 'lucide-react';
import useStore from '../store/useStore';

const InviteFriendModal = ({ isOpen, onClose }) => {
    const user = useStore(state => state.user);
    if (!isOpen) return null;

    const botUsername = "AddisStoreTestBot"; // You might want to get this from env or config
    const referralLink = `https://t.me/${botUsername}?start=${user?.id || 'ref'}`;

    const handleShare = () => {
        const text = `Check out Addis Store! use my link to get coupons: ${referralLink}`;
        const url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("Join me on Addis Store and get exclusive deals!")}`;

        if (window.Telegram?.WebApp?.openTelegramLink) {
            window.Telegram.WebApp.openTelegramLink(url);
        } else {
            window.open(url, '_blank');
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        alert("Link copied!");
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-[#fb7701] p-4 text-white text-center relative overflow-hidden">
                    <button onClick={onClose} className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
                        <Users size={24} className="text-white" />
                    </div>
                    <h2 className="text-lg font-bold">Invite Friends</h2>
                    <p className="text-xs opacity-90">Earn rewards for every friend who joins!</p>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    <div className="text-center space-y-2">
                        <p className="text-sm text-gray-600">
                            Share your unique link. When your friends join and make their first order, you both get <span className="font-bold text-[#fb7701]">200 ETB</span> credit!
                        </p>
                    </div>

                    {/* Link Box */}
                    <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg border border-gray-200">
                        <div className="flex-1 text-xs text-gray-500 truncate font-mono select-all">
                            {referralLink}
                        </div>
                        <button onClick={handleCopy} className="p-1.5 bg-white shadow-sm rounded-md hover:scale-105 transition-transform">
                            <Copy size={14} className="text-gray-600" />
                        </button>
                    </div>

                    <button
                        onClick={handleShare}
                        className="w-full bg-[#fb7701] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-200 active:scale-95 transition-transform"
                    >
                        <Share2 size={18} />
                        Invite via Telegram
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InviteFriendModal;
