import { useState, useEffect } from 'react';
import Cart from '../components/Cart';
import { Phone, MessageSquare, X, CheckCircle, Send, Tag } from 'lucide-react';
import API_URL from '../config';
import useStore from '../store/useStore';

const CartPage = ({ onCheckout, sellerUsername }) => {
    // Zustand Store
    const cart = useStore(state => state.cart);
    const onRemove = useStore(state => state.removeFromCart);

    const totalPrice = cart.reduce((sum, item) => {
        const itemPrice = item.selectedVariation ? item.selectedVariation.price : item.price;
        return sum + itemPrice * item.quantity;
    }, 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [couponMessage, setCouponMessage] = useState(null); // { type: 'success'|'error', text: '' }

    const finalPrice = Math.max(0, totalPrice - discount);

    const applyCoupon = async () => {
        if (!promoCode.trim()) return;

        try {
            const res = await fetch(`${API_URL}/api/coupons/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: promoCode, cartTotal: totalPrice })
            });
            const data = await res.json();

            if (data.success) {
                setDiscount(data.discount);
                setCouponMessage({ type: 'success', text: `Coupon applied! You saved ${data.discount} Birr` });
            } else {
                setDiscount(0);
                setCouponMessage({ type: 'error', text: data.message });
            }
        } catch (e) {
            console.error(e);
            setCouponMessage({ type: 'error', text: 'Error applying coupon' });
        }
    };

    const handleCheckout = async () => {
        // Generate generic message
        let msg = `Hi! I would like to place an order:\n\n`;
        cart.forEach(item => {
            const itemPrice = item.selectedVariation ? item.selectedVariation.price : item.price;
            const variationText = item.selectedVariation ? ` - ${item.selectedVariation.name}` : '';
            msg += `- ${item.title}${variationText} (x${item.quantity}) @ ${Math.floor(itemPrice * item.quantity)}\n`;
        });

        if (discount > 0) {
            msg += `\nSubtotal: ${Math.floor(totalPrice)} Birr`;
            msg += `\nDiscount: -${Math.floor(discount)} Birr`;
        }

        msg += `\nTotal: ${Math.floor(finalPrice)} Birr`;

        if (promoCode) {
            msg += `\nPromo Code: ${promoCode}`;
        }

        const telegramUrl = `https://t.me/${sellerUsername || 'AddisStoreSupport'}?text=${encodeURIComponent(msg)}`;

        // Notify Seller (Admin) via Bot
        try {
            const initData = window.Telegram?.WebApp?.initData || '';
            const user = window.Telegram?.WebApp?.initDataUnsafe?.user;

            await fetch(`${API_URL}/api/notify-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart.map(i => ({
                        ...i,
                        selectedVariation: i.selectedVariation // passing selected variation explicitly
                    })),
                    total: Math.floor(finalPrice),
                    userInfo: user
                })
            });
        } catch (error) {
            console.error("Failed to notify seller:", error);
        }

        // Open Telegram Chat
        window.open(telegramUrl, '_blank');

        // Optional: Call original checkout to save order to DB/Clear Cart if desired
        // For now, we just open the link as requested. 
        // await onCheckout(cart, promoCode, discount);
    };

    return (
        <div className="bg-[var(--tg-theme-secondary-bg-color)] min-h-dvh pb-32 font-sans pt-tg-safe">
            {/* Header / Subtotal */}
            {cart.length > 0 && (
                <div className="bg-[var(--tg-theme-bg-color)] p-4 border-b border-[var(--tg-theme-section-separator-color)] mb-2 space-y-1">
                    <div className="flex justify-between text-[var(--tg-theme-text-color)] text-sm">
                        <span>Subtotal</span>
                        <span>{Math.floor(totalPrice)} Birr</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-green-600 text-sm font-medium">
                            <span>Discount</span>
                            <span>-{Math.floor(discount)} Birr</span>
                        </div>
                    )}
                    <div className="flex justify-between text-[var(--tg-theme-text-color)] text-lg font-bold border-t border-[var(--tg-theme-section-separator-color)] pt-2 mt-2">
                        <span>Total</span>
                        <span>{Math.floor(finalPrice)} Birr</span>
                    </div>
                </div>
            )}

            <div className="md:max-w-4xl mx-auto md:p-4">
                <Cart
                    cartItems={cart}
                    onRemove={onRemove}
                />
            </div>

            {/* Bottom Checkout Bar */}
            {cart.length > 0 && (
                <div className="fixed bottom-[calc(60px+var(--tg-safe-area-bottom))] left-0 right-0 bg-[var(--tg-theme-bg-color)] border-t border-[var(--tg-theme-section-separator-color)] p-3 z-30">
                    {/* Promo Code Input */}
                    <div className="flex gap-2 mb-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Enter Promo Code"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                                className="w-full bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-text-color)] border border-gray-300 rounded-lg py-2 pl-9 pr-3 text-sm outline-none focus:border-[var(--tg-theme-button-color)]"
                            />
                            <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        <button
                            onClick={applyCoupon}
                            className="bg-gray-800 text-white px-4 rounded-lg text-sm font-medium active:scale-95 transition-transform"
                        >
                            Apply
                        </button>
                    </div>
                    {couponMessage && (
                        <div className={`text-xs mb-3 ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                            {couponMessage.text}
                        </div>
                    )}

                    <button
                        onClick={handleCheckout}
                        className="w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] py-3 rounded-xl font-semibold text-base shadow active:opacity-80 transition-opacity flex justify-between px-4"
                    >
                        <div className="flex items-center gap-2">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.79 6.89c-.19 1.99-1.01 6.89-1.42 9.1-.17.92-.5 1.22-.82 1.25-.7.06-1.23-.46-1.9-.91-1.06-.7-1.66-1.13-2.69-1.81-1.19-.79-.42-1.22.26-1.93.18-.18 3.26-2.99 3.33-3.24.01-.03.01-.12-.04-.17-.06-.05-.14-.04-.21-.02-.09.02-1.82 1.16-5.13 3.39-.49.33-.92.49-1.31.48-.43-.01-1.25-.24-1.86-.42-.75-.22-1.35-.34-1.29-.71.03-.19.29-.39.79-.58 3.1-1.33 5.16-2.22 6.19-2.65 2.94-1.23 3.55-1.44 3.96-1.44.09 0 .28.02.4.1.1.08.15.2.16.29 0 .04.01.12 0 .18z" />
                            </svg>
                            <span>Checkout ({totalItems})</span>
                        </div>
                        <span>{Math.floor(finalPrice)} Birr</span>
                    </button>

                </div>
            )}
        </div>
    );
};

export default CartPage;
