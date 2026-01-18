import { useState } from 'react';
import Cart from '../components/Cart';
import { Phone, MessageSquare, X, CheckCircle, Send } from 'lucide-react';

const CartPage = ({ cart, onIncrease, onDecrease, onRemove, onCheckout }) => {
    const [showContactModal, setShowContactModal] = useState(false);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleCheckout = async () => {
        await onCheckout();
        setShowContactModal(true);
    };

    return (
        <div className="bg-[#F3F4F6] min-h-screen pb-32">
            {/* Header / Subtotal */}
            {cart.length > 0 && (
                <div className="bg-white p-4 border-b border-gray-200 mb-3">
                    <div className="text-lg">
                        Subtotal ({totalItems} items): <span className="font-bold text-[#0F1111]">{Math.floor(totalPrice)} Birr</span>
                    </div>
                </div>
            )}

            {cart.length === 0 ? (
                <div className="bg-white p-8 text-center m-4 rounded-md shadow-sm">
                    <h2 className="text-xl font-bold mb-2">Your Addis Store Cart is empty.</h2>
                </div>
            ) : (
                <div className="md:max-w-4xl mx-auto md:p-4">
                    <Cart
                        cartItems={cart}
                        onIncrease={onIncrease}
                        onDecrease={onDecrease}
                        onRemove={onRemove}
                    />
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
                                href="https://t.me/AddisStoreSupport"
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
