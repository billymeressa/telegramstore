import { useState, useEffect } from 'react';
import Cart from '../components/Cart';
import API_URL from '../config';
import { Phone, MessageSquare, X, CheckCircle, Send } from 'lucide-react';

const CartPage = ({ cart, onIncrease, onDecrease, onRemove, onCheckout }) => {
    const [showContactModal, setShowContactModal] = useState(false);
    const [sellerUsername, setSellerUsername] = useState('AddisStoreSupport'); // Fallback
    const [orderMessage, setOrderMessage] = useState('');
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    useEffect(() => {
        if (showContactModal) {
            fetch(`${API_URL}/api/seller-info`)
                .then(res => res.json())
                .then(data => {
                    if (data.username) setSellerUsername(data.username);
                })
                .catch(console.error);
        }
    }, [showContactModal]);

    const handleCheckout = async () => {
        // Prepare message before cart is cleared
        let msg = `Hi! I just placed an order.\n\n`;
        cart.forEach(item => {
            msg += `- ${item.title} (x${item.quantity})\n`;
        });
        msg += `\nTotal: ${Math.floor(totalPrice)} Birr`;
        setOrderMessage(encodeURIComponent(msg));

        await onCheckout();
        setShowContactModal(true);
    };

    return (
        <div className="bg-[var(--tg-theme-secondary-bg-color)] min-h-screen pb-32 font-sans">
            {/* Header / Subtotal */}
            {cart.length > 0 && (
                <div className="bg-[var(--tg-theme-bg-color)] p-4 border-b border-[var(--tg-theme-section-separator-color)] mb-2">
                    <div className="text-[var(--tg-theme-text-color)] text-base font-normal">
                        Subtotal ({totalItems} items): <span className="font-semibold text-[var(--tg-theme-text-color)]">{Math.floor(totalPrice)} Birr</span>
                    </div>
                </div>
            )}

            <div className="md:max-w-4xl mx-auto md:p-4">
                <Cart
                    cartItems={cart}
                    onIncrease={onIncrease}
                    onDecrease={onDecrease}
                    onRemove={onRemove}
                />
            </div>

            {/* Bottom Checkout Bar */}
            {cart.length > 0 && (
                <div className="fixed bottom-[56px] left-0 right-0 bg-[var(--tg-theme-bg-color)] border-t border-[var(--tg-theme-section-separator-color)] p-3 z-30 pb-safe">
                    <button
                        onClick={handleCheckout}
                        className="w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] py-3 rounded-xl font-semibold text-base shadow active:opacity-80 transition-opacity"
                    >
                        Checkout ({totalItems} items)
                    </button>

                </div>
            )}



            {showContactModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-t-xl sm:rounded-xl p-6 shadow-xl relative animate-in slide-in-from-bottom-10 duration-300">
                        <button
                            onClick={() => setShowContactModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>

                        <h3 className="text-xl font-bold text-[#111827] mb-2 flex items-center gap-2">
                            <CheckCircle className="text-[#054D3B]" size={24} />
                            Order Placed!
                        </h3>
                        <p className="text-gray-600 text-sm mb-6">
                            Your order has been submitted successfully. Please contact the merchant to arrange payment and delivery.
                        </p>

                        <div className="space-y-3">
                            <a
                                href="tel:+251911234567"
                                className="flex items-center justify-center gap-3 w-full bg-white border-2 border-[#054D3B] text-[#054D3B] font-bold py-3 rounded-xl hover:bg-[#F0FDF9] transition-colors"
                            >
                                <Phone size={20} />
                                Call Merchant
                            </a>

                            <a
                                href={`https://t.me/${sellerUsername}?text=${orderMessage}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 w-full bg-[#0088cc] border-2 border-[#0088cc] text-white font-bold py-3 rounded-xl hover:bg-[#0077b5] transition-colors"
                            >
                                <Send size={20} />
                                Message on Telegram
                            </a>

                            <button
                                onClick={() => setShowContactModal(false)}
                                className="flex items-center justify-center gap-3 w-full bg-[#D4AF37] text-[#111827] font-bold py-3 rounded-xl shadow-md active:scale-[0.98] transition-transform mt-4"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
