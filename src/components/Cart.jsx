import React from 'react';
import { X } from 'lucide-react';

function Cart({ cartItems, onRemove }) {
    const totalPrice = cartItems.reduce((sum, item) => {
        const itemPrice = item.selectedVariation ? item.selectedVariation.price : item.price;
        return sum + itemPrice * item.quantity;
    }, 0);

    if (cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <span className="text-4xl mb-2 opacity-50">🛒</span>
                <p>Your cart is empty</p>
            </div>
        );
    }
    const FREE_SHIPPING_THRESHOLD = 1500;
    const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice);
    const progressPercentage = Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100);

    return (
        <div className="space-y-3 pb-4 px-3">
            {/* Free Shipping Progress Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-gray-700">
                        {remainingForFreeShipping > 0
                            ? `Add ${remainingForFreeShipping} ETB for Free Shipping`
                            : "🎉 Free Shipping Unlocked!"}
                    </span>
                    <span className="text-xs font-bold text-primary">
                        {Math.floor(progressPercentage)}%
                    </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                        className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </div>

            {/* Cart Items */}
            {cartItems.map((item) => (
                <div key={item.cartId} className="flex bg-white p-3 rounded-xl shadow-sm border border-gray-100 gap-3 relative group">
                    {/* Item Image */}
                    <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200">
                        {item.images && item.images.length > 0 ? (
                            <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xl opacity-20 grayscale">📦</span>
                        )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                        <div>
                            <div className="flex justify-between items-start gap-2">
                                <h4 className="font-medium text-gray-800 text-sm leading-tight line-clamp-2 pr-6">
                                    {item.title}
                                </h4>
                                <button
                                    onClick={() => onRemove(item.cartId)}
                                    className="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-1 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            {item.selectedVariation && (
                                <p className="text-xs text-gray-400 mt-1 font-medium bg-gray-50 inline-block px-1.5 py-0.5 rounded">
                                    {item.selectedVariation.name}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-between items-end mt-2">
                            <div className="text-base font-bold text-primary">
                                <span className="text-[10px] font-medium mr-0.5 text-gray-500">ETB</span>
                                {Math.floor(item.selectedVariation ? item.selectedVariation.price : item.price)}
                            </div>
                            <div className="text-xs text-gray-400 font-medium">
                                x{item.quantity}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Cart;
