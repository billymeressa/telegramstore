import React, { useState } from 'react';
import useStore from '../store/useStore';
import { Share, Copy, Gift, Coins, Trophy, ArrowLeft, Ticket } from 'lucide-react';
import SlotMachine from '../components/SlotMachine';
import { useNavigate } from 'react-router-dom';

const Rewards = () => {
    const user = useStore(state => state.user);
    const [copied, setCopied] = useState(false);
    const [showSlots, setShowSlots] = useState(false);
    const navigate = useNavigate();

    const BOT_USERNAME = import.meta.env.VITE_BOT_USERNAME || 'AddisStoreBot';
    const referralCode = user?.referralCode || user?.userId || '---';

    const inviteLink = `https://t.me/${BOT_USERNAME}?start=${referralCode}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = () => {
        const url = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(`Join me and get 500 ETB off your first order! 🎁`)}`;
        if (window.Telegram?.WebApp?.openTelegramLink) {
            window.Telegram.WebApp.openTelegramLink(url);
        } else {
            window.open(url, '_blank');
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
                    <h1 className="text-lg font-bold text-black">Rewards Center</h1>
                </div>
            </div>

            {/* Hero Section */}
            <div className="bg-gradient-to-b from-white to-[#fff0e0] px-6 py-8 text-center relative overflow-hidden">
                {/* Decorative BG */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-orange-200 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-red-200 rounded-full blur-3xl opacity-30 translate-x-1/2 translate-y-1/2"></div>

                <div className="relative z-10">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-orange-50 animate-bounce">
                        <Gift size={40} className="text-[#fb7701]" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2 leading-tight">
                        Invite Friends<br /><span className="text-[#fb7701]">& Earn Cash</span>
                    </h1>
                    <p className="text-gray-600 text-sm max-w-[280px] mx-auto">
                        Get <span className="font-bold text-[#be0000]">200 ETB</span> automatically when a friend places their first order!
                    </p>
                </div>
            </div>

            {/* Stats Card */}
            <div className="px-4 -mt-6 relative z-10 mb-6">
                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-yellow-50 p-3 rounded-full border border-yellow-100">
                            <Coins className="text-yellow-600" size={28} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Your Balance</p>
                            <p className="text-2xl font-black text-gray-900">
                                {user?.walletBalance || 0} <span className="text-sm font-normal text-gray-400">ETB</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 flex flex-col gap-3 mb-8">
                <button
                    onClick={handleShare}
                    className="w-full bg-[#fb7701] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                    <Share size={20} />
                    <span>Invite Friends</span>
                </button>

                <button
                    onClick={() => setShowSlots(true)}
                    className="w-full bg-gradient-to-r from-purple-700 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-white/20 w-full -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    <Trophy size={20} className="text-yellow-300" />
                    <span>Spin Lucky Wheel</span>
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded ml-1 animate-pulse">HOT</span>
                </button>
            </div>

            {/* Referral Link */}
            <div className="px-4 mb-8">
                <h3 className="text-sm font-bold text-gray-700 mb-2 ml-1">Your Unique Link</h3>
                <div className="bg-white rounded-xl p-2 flex items-center gap-2 shadow-sm border border-gray-200">
                    <div className="flex-1 px-3 py-2 overflow-hidden bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 truncate font-mono select-all">
                            {inviteLink}
                        </p>
                    </div>
                    <button
                        onClick={handleCopy}
                        className="p-3 bg-white border border-gray-100 rounded-lg active:bg-gray-50 transition-colors shadow-sm"
                    >
                        {copied ? <span className="text-green-600 font-bold text-xs">Copied</span> : <Copy size={20} className="text-gray-500" />}
                    </button>
                </div>
            </div>

            {/* How it works Steps */}
            <div className="px-6 pb-8">
                <h3 className="text-center text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest">How it works</h3>
                <div className="relative space-y-8">
                    {/* Vertical connector line */}
                    <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-200 -z-10"></div>

                    <Step
                        num="1"
                        title="Share your link"
                        desc="Send your exclusive link to friends on Telegram."
                        color="bg-blue-500"
                    />
                    <Step
                        num="2"
                        title="They Shop"
                        desc="Your friend gets 500 ETB off their first order."
                        color="bg-[#fb7701]"
                    />
                    <Step
                        num="3"
                        title="You Earn"
                        desc="You get 200 ETB instantly credited to your wallet!"
                        color="bg-green-500"
                    />
                </div>
            </div>

            {showSlots && <SlotMachine onClose={() => setShowSlots(false)} />}
        </div>
    );
};

const Step = ({ num, title, desc, color }) => (
    <div className="flex gap-4 items-start bg-white/50 backdrop-blur rounded-xl p-2">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-md ${color}`}>
            {num}
        </div>
        <div>
            <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
        </div>
    </div>
);

export default Rewards;
