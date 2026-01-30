import React, { useState } from 'react';
import useStore from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShieldCheck, CreditCard } from 'lucide-react';
import ProductList from '../components/ProductList'; // For "You might also like"

const CartPage = () => {
    const { cart, removeFromCart, updateQuantity, cartTotal } = useStore();
    const navigate = useNavigate();
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const handleCheckout = () => {
        setIsCheckingOut(true);
        // Simulate checkout process or navigate to checkout page
        setTimeout(() => {
            alert("Proceeding to Payment...");
            setIsCheckingOut(false);
        }, 1000);
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center p-4">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <ShoppingCart size={40} className="text-gray-400" />
                </div>
                <h2 className="text-lg font-bold text-gray-800 mb-2">Your cart is empty</h2>
                <p className="text-sm text-gray-500 mb-6 text-center">Looks like you haven't added anything to your cart yet.</p>
                <button
                    onClick={() => navigate('/')}
                    className="bg-[#fb7701] text-white px-8 py-3 rounded-full font-bold text-sm shadow-lg active:scale-95 transition-transform"
                >
                    Start Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="bg-[#f5f5f5] min-h-screen pb-[120px]">
            {/* Header */}
            <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-200 sticky top-0 z-40">
                <button onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} className="text-gray-700" />
                </button>
                <h1 className="text-lg font-bold text-black flex-1 text-center pr-6">Shopping Cart ({cart.length})</h1>
            </div>

            {/* Free Shipping Banner */}
            <div className="bg-[#e6f4ea] px-4 py-2 flex items-center justify-center gap-2 text-xs font-medium text-[#1e8e3e]">
                <ShieldCheck size={14} />
                Free Shipping on all orders included!
            </div>

            {/* Cart Items */}
            <div className="space-y-2 mt-2 px-2">
                {cart.map((item) => (
                    <div key={`${item.id}-${JSON.stringify(item.selectedVariation)}`} className="bg-white p-3 rounded-lg shadow-sm flex gap-3">
                        {/* Checkbox (Visual only for now) */}
                        <div className="flex items-center">
                            <div className="w-5 h-5 rounded-full border-2 border-[#fb7701] flex items-center justify-center bg-[#fb7701]">
                                <Check size={12} className="text-white" />
                            </div>
                        </div>

                        {/* Image */}
                        <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                            <img src={item.images?.[0]} alt={item.title} className="w-full h-full object-cover" />
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xs font-normal text-black line-clamp-2 leading-tight mb-1">{item.title}</h3>
                                {item.selectedVariation && (
                                    <div className="text-[10px] text-gray-500 bg-gray-100 inline-block px-1.5 py-0.5 rounded">
                                        {Object.values(item.selectedVariation).filter(v => typeof v !== 'object').join(', ')}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between mt-2">
                                <div className="text-[#fb7701] font-bold text-base">
                                    ETB {Math.floor(item.price)}
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex items-center border border-gray-200 rounded-full h-7">
                                    <button
                                        onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeFromCart(item.id)}
                                        className="w-7 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-l-full"
                                    >
                                        {item.quantity === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
                                    </button>
                                    <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="w-7 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-r-full"
                                    >
                                        <Plus size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Payment Trust */}
            <div className="mt-4 px-4">
                <div className="flex items-center gap-2 justify-center opacity-50 grayscale">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" className="h-4" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" className="h-3" />
                    <span className="text-[10px] font-bold border border-gray-400 rounded px-1">Telebirr</span>
                </div>
                <div className="text-center text-[10px] text-gray-400 mt-2 flex items-center justify-center gap-1">
                    <ShieldCheck size={10} /> Secure Layout
                </div>
            </div>

            {/* Sticky Order Summary Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-[calc(10px+var(--tg-safe-area-bottom))]">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Total ({cart.length} items)</span>
                        <span className="text-[#fb7701] text-xl font-bold">ETB {Math.floor(cartTotal)}</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        className="bg-[#fb7701] text-white px-8 py-3 rounded-full font-bold text-sm shadow-lg active:scale-95 transition-transform"
                    >
                        Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper Icon
const Check = ({ size, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

// Helper Icon
const ShoppingCart = ({ size, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
);

export default CartPage;
