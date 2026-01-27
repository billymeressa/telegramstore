import { useState, useEffect } from 'react';

import { X, Gift, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const CouponPopup = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Show popup after 2 seconds on first visit
        const hasSeenCoupon = localStorage.getItem('hasSeenCoupon');
        if (!hasSeenCoupon) {
            const timer = setTimeout(() => {
                setIsOpen(true);
                // Trigger confetti
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    zIndex: 9999
                });
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClaim = () => {
        localStorage.setItem('hasSeenCoupon', 'true');
        setIsOpen(false);
        // Additional confetti on claim
        confetti({
            particleCount: 100,
            spread: 100,
            origin: { y: 0.6 },
            zIndex: 9999
        });
    };

    const handleClose = () => {
        localStorage.setItem('hasSeenCoupon', 'true');
        setIsOpen(false);
    };


    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    {/* Popup Card */}
                    <div
                        className="relative w-full max-w-sm bg-gradient-to-br from-red-600 to-orange-500 rounded-3xl p-1 shadow-2xl"
                    >
                        <button
                            onClick={handleClose}
                            className="absolute -top-3 -right-3 bg-white text-black p-2 rounded-full shadow-lg z-20 hover:scale-110 transition-transform"
                        >
                            <X size={20} />
                        </button>

                        <div className="bg-white rounded-[1.4rem] p-6 text-center relative overflow-hidden">
                            {/* Decorative Background */}
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-orange-100 to-white -z-10 rounded-t-[1.4rem]"></div>

                            <div className="mb-4 inline-flex items-center justify-center p-3 bg-red-100 rounded-full text-red-600 mb-4">
                                <Gift size={48} strokeWidth={1.5} />
                            </div>

                            <h2 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">
                                CONGRATULATIONS!
                            </h2>
                            <p className="text-gray-500 text-sm mb-6">
                                You've been selected for a welcome gift
                            </p>

                            {/* Coupon Ticket */}
                            <div className="border-2 border-dashed border-red-200 bg-red-50 rounded-xl p-4 mb-6 relative">
                                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-r-2 border-red-200"></div>
                                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-l-2 border-red-200"></div>

                                <div className="text-red-600 font-bold text-xs uppercase tracking-wider mb-1">Coupon Bundle</div>
                                <div className="text-4xl font-black text-gray-900 leading-none mb-1">
                                    1,000<span className="text-lg align-top">Br</span>
                                </div>
                                <div className="text-xs text-gray-500">Valid for next 24 hours</div>
                            </div>

                            <button
                                onClick={handleClaim}
                                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/30 text-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                            >
                                <Sparkles size={20} />
                                CLAIM NOW
                            </button>

                            <p className="mt-4 text-[10px] text-gray-400">
                                Terms and conditions apply. Limited time offer.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CouponPopup;
