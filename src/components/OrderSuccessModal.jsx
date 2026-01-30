import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { CheckCircle, ShoppingBag, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OrderSuccessModal = ({ isOpen, onClose, savings = 0 }) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            // Temu-style Confetti Blast
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#ff0000', '#ffa500', '#ffff00', '#008000', '#0000ff', '#4b0082', '#ee82ee']
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#ff0000', '#ffa500', '#ffff00', '#008000', '#0000ff', '#4b0082', '#ee82ee']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();

            // Haptic Feedback
            if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            }
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 100 }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            y: 0,
                            transition: { type: "spring", damping: 12, stiffness: 100 }
                        }}
                        exit={{ scale: 0.8, opacity: 0, y: 100 }}
                        className="relative w-full max-w-sm bg-white rounded-3xl p-6 text-center shadow-2xl overflow-hidden"
                    >
                        {/* Decorative Background Rays */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_15deg,rgba(255,165,0,0.1)_15deg_30deg)] animate-[spin_10s_linear_infinite] opacity-50 pointer-events-none origin-top" />

                        <div className="relative z-10">
                            {/* Success Icon */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg"
                            >
                                <CheckCircle size={40} className="text-green-600" strokeWidth={3} />
                            </motion.div>

                            <h2 className="text-2xl font-black text-gray-900 mb-2">Order Placed!</h2>
                            <p className="text-gray-500 mb-6 font-medium">
                                Thank you for your purchase. We've notified the seller.
                            </p>

                            {/* Savings Badge (if any) */}
                            {savings > 0 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="inline-block bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold mb-6 border border-red-100"
                                >
                                    🔥 You saved {savings} ETB!
                                </motion.div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        onClose();
                                        navigate('/');
                                    }}
                                    className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-orange-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
                                >
                                    <ShoppingBag size={20} />
                                    Continue Shopping
                                </button>

                                <button
                                    onClick={() => window.Telegram?.WebApp?.close()}
                                    className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform"
                                >
                                    Close App
                                </button>
                            </div>
                        </div>

                        {/* Close Button (Top Right) */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default OrderSuccessModal;
