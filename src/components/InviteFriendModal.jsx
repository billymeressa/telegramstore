import { motion, AnimatePresence } from 'framer-motion';
import { Users, Copy, Send, X, Gift } from 'lucide-react';
import { useState } from 'react';
import useStore from '../store/useStore';
import confetti from 'canvas-confetti';

const InviteFriendModal = ({ isOpen, onClose }) => {
    const user = useStore(state => state.user);
    const settings = useStore(state => state.settings);
    const [copied, setCopied] = useState(false);

    // Default referral amount if setting not present
    const referralAmount = settings?.referral_reward_amount || 50;

    // Generate referral link
    // Default to a generic bot link if user ID unavailable (e.g. dev mode)
    const botUsername = "AddisStoreTestBot"; // You might want to move this to config
    const referralCode = user?.id ? `ref_${user.id}` : 'ref_generic';
    const inviteLink = `https://t.me/${botUsername}?start=${referralCode}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);

        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.selectionChanged();
        }
    };

    const handleShare = () => {
        const text = `Join me on Addis Store and get coupons! Use my link to start shopping:`;
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(text)}`;

        // Use Telegram WebApp openLink if available, else window.open
        if (window.Telegram?.WebApp?.openTelegramLink) {
            window.Telegram.WebApp.openTelegramLink(shareUrl);
        } else {
            window.open(shareUrl, '_blank');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 50 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="relative w-full max-w-sm bg-gradient-to-b from-[#FFF0E0] to-white rounded-3xl p-6 text-center shadow-2xl overflow-hidden"
                    >
                        {/* Decorative Circles */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#fb7701]/10 rounded-full blur-2xl" />
                        <div className="absolute top-20 -left-10 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl" />

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 p-2 bg-white/50 hover:bg-white rounded-full transition-colors z-10"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>

                        {/* Icon/Image */}
                        <div className="relative mx-auto w-20 h-20 mb-4">
                            <motion.div
                                animate={{ rotate: [0, -10, 10, 0] }}
                                transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                                className="w-full h-full bg-gradient-to-br from-[#fb7701] to-red-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white"
                            >
                                <Users size={36} className="text-white" />
                            </motion.div>
                            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm flex items-center gap-1">
                                <Gift size={12} /> +{referralAmount} ETB
                            </div>
                        </div>

                        {/* Content */}
                        <h2 className="text-2xl font-black text-gray-900 mb-2 leading-tight">
                            Invite Friends,<br />
                            <span className="text-[#fb7701]">Earn Cash!</span>
                        </h2>

                        <p className="text-gray-600 text-sm mb-6 px-2">
                            Share your link with friends. When they join, they get <span className="font-bold text-[#fb7701]">exclusive coupons</span> and you get <span className="font-bold text-[#fb7701]">{referralAmount} ETB</span>!
                        </p>

                        {/* Link Box */}
                        <div className="bg-gray-100 p-3 rounded-xl flex items-center justify-between mb-6 border border-gray-200">
                            <div className="text-xs text-gray-500 font-mono truncate px-2 select-all">
                                {inviteLink}
                            </div>
                            <button
                                onClick={handleCopy}
                                className={`p-2 rounded-lg transition-colors ${copied ? 'bg-green-100 text-green-600' : 'bg-white text-gray-600 hover:text-black shadow-sm'}`}
                            >
                                {copied ? <span className="text-[10px] font-bold">COPIED</span> : <Copy size={16} />}
                            </button>
                        </div>

                        {/* Main CTA */}
                        <button
                            onClick={handleShare}
                            className="w-full bg-[#2AABEE] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 active:scale-95 transition-transform flex items-center justify-center gap-2 mb-3"
                        >
                            <Send size={20} />
                            Share to Telegram
                        </button>

                        <p className="text-[10px] text-gray-400">
                            Terms and conditions apply. Max 10 invites per day.
                        </p>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default InviteFriendModal;
