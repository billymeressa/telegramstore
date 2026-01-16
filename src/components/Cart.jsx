import React from 'react';

function Cart({ cartItems, onIncrease, onDecrease, onRemove }) {
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-tg-hint">
                <span className="text-4xl mb-2">🛒</span>
                <p>Your cart is empty</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-24">
            {cartItems.map((item) => (
                <div key={item.id} className="flex bg-white p-3 border border-gray-200 rounded-sm shadow-sm gap-3">
                    {/* Item Image (if available or placeholder) */}
                    <div className="w-24 h-24 bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {item.images && item.images.length > 0 ? (
                            <img src={item.images[0]} alt={item.title} className="max-w-full max-h-full object-contain" />
                        ) : (
                            <span className="text-2xl opacity-20 grayscale">📦</span>
                        )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                        <div>
                            <h4 className="font-medium text-[#111827] text-base leading-snug line-clamp-2">
                                {item.title}
                            </h4>

                            <div className="text-lg font-bold text-[#111827] mt-1">
                                {Math.floor(item.price)} <span className="text-[#0F1111] font-bold">Birr</span>
                            </div>
                            <div className="text-xs text-[#054D3B] mt-1">
                                In Stock
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center border border-gray-300 rounded-md bg-[#f0f2f2] shadow-sm">
                                <button
                                    onClick={() => onDecrease(item)}
                                    className="w-8 h-8 flex items-center justify-center text-[#111827] font-medium hover:bg-[#E5E7EB] rounded-l-md"
                                >
                                    {item.quantity === 1 ? '🗑' : '−'}
                                </button>
                                <div className="w-8 h-8 flex items-center justify-center bg-white border-x border-gray-300 text-sm text-[#111827]">
                                    {item.quantity}
                                </div>
                                <button
                                    onClick={() => onIncrease(item)}
                                    className="w-8 h-8 flex items-center justify-center text-[#111827] font-medium hover:bg-[#E5E7EB] rounded-r-md"
                                >
                                    +
                                </button>
                            </div>
                            <button className="text-xs px-2 py-1 border border-gray-300 rounded shadow-sm bg-white hover:bg-gray-50 text-[#111827]">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Cart;
