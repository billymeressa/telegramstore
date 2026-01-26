import { useState, useEffect } from 'react';
import Cart from '../components/Cart';
import { Phone, MessageSquare, X, CheckCircle, Send } from 'lucide-react';

const CartPage = ({ cart, onIncrease, onDecrease, onRemove, onCheckout }) => {
    const totalPrice = cart.reduce((sum, item) => {
        const itemPrice = item.selectedVariation ? item.selectedVariation.price : item.price;
        return sum + itemPrice * item.quantity;
    }, 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleCheckout = async () => {
        await onCheckout();
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
        </div>
    );
};

export default CartPage;
