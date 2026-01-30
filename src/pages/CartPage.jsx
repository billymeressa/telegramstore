import { useState, useEffect } from 'react';
import Cart from '../components/Cart';
import CartProgress from '../components/CartProgress';
import { Phone, MessageSquare, X, CheckCircle, Send, Tag } from 'lucide-react';
import API_URL from '../config';
import useStore from '../store/useStore';


const CartPage = ({ onCheckout, sellerUsername }) => {
    // Zustand Store
    // Zustand Store
    const cartState = useStore(state => state.cart);
    const cart = Array.isArray(cartState) ? cartState : [];
    const onRemove = useStore(state => state.removeFromCart);
    const walletBalance = useStore(state => state.walletBalance);

    const totalPrice = cart.reduce((sum, item) => {
        const itemPrice = item.selectedVariation ? item.selectedVariation.price : item.price;
        return sum + itemPrice * item.quantity;
    }, 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const [promoCode, setPromoCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponMessage, setCouponMessage] = useState(null); // { type: 'success'|'error', text: '' }
    const [useCredits, setUseCredits] = useState(false);

    // Credit Redemption Rules
    const MIN_PURCHASE_FOR_CREDITS = 200;
    const canUseCredits = totalPrice >= MIN_PURCHASE_FOR_CREDITS && walletBalance > 0;

    // Calculate Credits to apply
    // If using credits, apply up to the remaining total after coupon
    const creditDiscount = (useCredits && canUseCredits)
        ? Math.min(walletBalance, Math.max(0, totalPrice - couponDiscount))
        : 0;

    const finalPrice = Math.max(0, totalPrice - couponDiscount - creditDiscount);

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
                setCouponDiscount(data.discount);
                setCouponMessage({ type: 'success', text: `Coupon applied! You saved ${data.discount} Birr` });
            } else {
                setCouponDiscount(0);
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

        msg += `\nSubtotal: ${Math.floor(totalPrice)} Birr`;

        if (couponDiscount > 0) {
            msg += `\nCoupon Discount: -${Math.floor(couponDiscount)} Birr`;
        }

        if (creditDiscount > 0) {
            msg += `\nCredit Discount: -${Math.floor(creditDiscount)} Birr (used ${Math.floor(creditDiscount)} credits)`;
        }

        // Ideally shipping fee should be dynamic or calculated. 
        // For now, assuming shipping is handled externally or included, 
        // but prompt asked to show "Shipping Fee". 
        // If we don't have shipping logic yet, maybe 0 or omitted?
        // Prompt 7 mentioned "Free Shipping Progress Bar" but didn't implement actual shipping fee logic?
        // Let's assume Free Shipping or TBD. 
        // The prompt "Prompt 8" says "Final order message... clearly show the: Subtotal, Credit Discount, Shipping Fee, and Final Total".
        // I will add a placeholder or logic for Shipping Fee.
        // If Free Shipping Threshold (1500) is reached, 0. Else, maybe standard fee?
        // The prompt 7 just said "Free Shipping Progress Bar" but didn't specify the fee if NOT free.
        // I'll default to 0 for now or added if I knew the fee. 
        // Let's check if there's a standard fee in Cart.jsx? No.
        // I will display "Shipping: To be calculated" or "0" if free.
        // Actually, let's look at the Free Shipping limit: 1500.
        // Let's assume a standard fee if < 1500? Or just display 0 if free.
        // Let's add 'Shipping Fee' line.
        const FREE_SHIPPING_THRESHOLD = 1500;
        const shippingFee = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : 0; // Keeping 0 for now as no fee specified for non-free.
        // Wait, if I put 0, user might think it's always free. 
        // But I don't have instructions on WHAT the fee is. 
        // I'll leave Shipping Fee as part of the message but maybe generic text if > 0 unavailable.
        // "Shipping Fee: Free" or "Shipping Fee: Contact Seller".

        msg += `\nShipping Fee: ${shippingFee === 0 && totalPrice >= FREE_SHIPPING_THRESHOLD ? 'Free' : 'TBD'}`;
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
                        selectedVariation: i.selectedVariation
                    })),
                    subtotal: Math.floor(totalPrice),
                    shippingFee: shippingFee,
                    discount: Math.floor(couponDiscount + creditDiscount), // Total discount
                    creditDiscount: Math.floor(creditDiscount),
                    couponDiscount: Math.floor(couponDiscount),
                    total: Math.floor(finalPrice),
                    userInfo: user
                })
            });
        } catch (error) {
            console.error("Failed to notify seller:", error);
        }

        // Open Telegram Chat
        window.open(telegramUrl, '_blank');
    };

    return (
        <div className="bg-gray-50 min-h-dvh pb-40 font-sans pt-[var(--tg-content-safe-area-top)]">

            {/* Gamification: Progress Bar */}
            <CartProgress />

            {/* Header / Subtotal - Clean Card Style */}
            {cart.length > 0 && (
                <div className="bg-white p-4 mb-2 shadow-sm border-b border-gray-100">
                    <div className="flex justify-between text-gray-600 text-sm mb-1">
                        <span>Subtotal</span>
                        <span>{Math.floor(totalPrice)} Birr</span>
                    </div>
                    {couponDiscount > 0 && (
                        <div className="flex justify-between text-success text-sm font-medium mb-1">
                            <span>Coupon Discount</span>
                            <span>-{Math.floor(couponDiscount)} Birr</span>
                        </div>
                    )}
                    <div className="flex justify-between text-gray-900 text-lg font-bold border-t border-gray-100 pt-2 mt-2">
                        <span>Total Estimate</span>
                        <span className="text-primary">{Math.floor(finalPrice)} Birr</span>
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
                <div className="fixed bottom-[calc(60px+var(--tg-safe-area-bottom))] left-0 right-0 bg-white border-t border-gray-100 p-3 z-30 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
                    {/* Promo Code Input */}
                    <div className="flex gap-2 mb-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Promo Code"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                                className="w-full bg-gray-50 text-gray-800 border-none rounded-lg py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                            />
                            <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        <button
                            onClick={applyCoupon}
                            className="bg-gray-900 text-white px-5 rounded-lg text-sm font-medium active:scale-95 transition-transform"
                        >
                            Apply
                        </button>
                    </div>
                    {couponMessage && (
                        <div className={`text-xs mb-3 font-medium px-1 ${couponMessage.type === 'success' ? 'text-success' : 'text-danger'}`}>
                            {couponMessage.text}
                        </div>
                    )}

                    <button
                        onClick={handleCheckout}
                        className="w-full bg-primary text-white py-3.5 rounded-full font-bold text-base shadow-lg shadow-primary/30 active:scale-95 transition-all flex justify-between px-6 items-center"
                    >
                        <span>Checkout ({totalItems})</span>
                        <span>{Math.floor(finalPrice)} Birr</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default CartPage;
