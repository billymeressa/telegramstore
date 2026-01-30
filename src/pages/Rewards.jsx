import React, { useState } from 'react';
import useStore from '../store/useStore';
import { Share, Copy, Gift, Coins, Trophy } from 'lucide-react';
import SlotMachine from '../components/SlotMachine';


const Rewards = () => {
    const user = useStore(state => state.user);
    const [copied, setCopied] = useState(false);
    const [showSlots, setShowSlots] = useState(false);

    // Determines Bot Username for deep linking
    // In production, this should be environmental or fetched. 
    // Fallback to 'AddisStoreBot' or similar if not known, but ideal to have it in config.
    // For now, I'll assume we can get it from import.meta.env or hardcode a placeholder the user can change.
    const BOT_USERNAME = import.meta.env.VITE_BOT_USERNAME || 'AddisStoreBot';
    const referralCode = user?.referralCode || user?.userId || '---';

    const inviteLink = `https://t.me/${BOT_USERNAME}?start=${referralCode}`;
    const inviteMessage = `Join me on ${BOT_USERNAME} and get 500 ETB off your first order! 🎁\n\nShop now: ${inviteLink}`;

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
        <div className="min-h-dvh bg-[var(--tg-theme-secondary-bg-color)] pb-32 pt-[var(--tg-content-safe-area-top)] font-sans">
            {/* Header */}
            <div className="bg-[var(--tg-theme-bg-color)] p-4 rounded-b-3xl shadow-sm text-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift size={32} className="text-[var(--tg-theme-button-color)]" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--tg-theme-text-color)] mb-2">
                    Invite Friends & Earn
                </h1>
                <p className="text-[var(--tg-theme-hint-color)] text-sm px-4">
                    Share your unique link. When a friend places their first order, you get <span className="font-bold text-[var(--tg-theme-button-color)]">200 ETB</span>!
                </p>
            </div>

            {/* Stats Card */}
            <div className="px-4 mb-4">
                <div className="bg-[var(--tg-theme-bg-color)] rounded-2xl p-4 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-100 p-2 rounded-full">
                            <Coins className="text-yellow-600" size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-[var(--tg-theme-hint-color)]">Your Balance</p>
                            <p className="text-xl font-bold text-[var(--tg-theme-text-color)]">
                                {user?.walletBalance || 0} <span className="text-sm font-normal text-[var(--tg-theme-hint-color)]">ETB</span>
                            </p>
                        </div>
                    </div>
                    {/* Placeholder for 'Redeem' or 'History' button if needed */}
                </div>
            </div>

            {/* Referral Link Section */}
            <div className="px-4 mb-4">
                <h3 className="text-sm font-semibold text-[var(--tg-theme-text-color)] mb-3 ml-1">Your Referral Link</h3>
                <div className="bg-[var(--tg-theme-bg-color)] rounded-xl p-2 flex items-center gap-2 shadow-sm border border-[var(--tg-theme-section-separator-color)]">
                    <div className="flex-1 px-3 py-2 overflow-hidden">
                        <p className="text-sm text-[var(--tg-theme-text-color)] truncate font-mono bg-[var(--tg-theme-secondary-bg-color)] p-2 rounded select-all">
                            {inviteLink}
                        </p>
                    </div>
                    <button
                        onClick={handleCopy}
                        className="p-3 bg-[var(--tg-theme-secondary-bg-color)] rounded-lg active:scale-95 transition-transform"
                    >
                        {copied ? <span className="text-green-500 font-bold text-xs">Copied</span> : <Copy size={20} className="text-[var(--tg-theme-hint-color)]" />}
                    </button>
                </div>
            </div>

            {/* Action Button */}
            <div className="px-4 flex flex-col gap-3">
                <button
                    onClick={handleShare}
                    className="w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                    <Share size={20} />
                    <span>Share with Friends</span>
                </button>

                <button
                    onClick={() => setShowSlots(true)}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform border border-purple-400/30 relative overflow-hidden"
                >
                    {/* Shimmer */}
                    <div className="absolute inset-0 bg-white/20 w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
                    <Trophy size={20} className="text-yellow-300" />
                    <span>Play Daily Slots</span>
                </button>
            </div>

            {showSlots && <SlotMachine onClose={() => setShowSlots(false)} />}

            {/* How it works */}
            <div className="px-6 mt-8">
                <h3 className="text-center text-sm font-medium text-[var(--tg-theme-hint-color)] mb-4 uppercase tracking-wider">How it works</h3>
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center font-bold text-blue-500">1</div>
                        <div>
                            <h4 className="font-semibold text-[var(--tg-theme-text-color)] text-sm">Share your link</h4>
                            <p className="text-xs text-[var(--tg-theme-hint-color)] mt-0.5">Send your exclusive link to friends on Telegram.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center font-bold text-purple-500">2</div>
                        <div>
                            <h4 className="font-semibold text-[var(--tg-theme-text-color)] text-sm">They Shop</h4>
                            <p className="text-xs text-[var(--tg-theme-hint-color)] mt-0.5">Your friend gets 500 ETB off their first order.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-50 rounded-full flex items-center justify-center font-bold text-green-500">3</div>
                        <div>
                            <h4 className="font-semibold text-[var(--tg-theme-text-color)] text-sm">You Earn</h4>
                            <p className="text-xs text-[var(--tg-theme-hint-color)] mt-0.5">You get 200 ETB instantly after their purchase!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Rewards;
