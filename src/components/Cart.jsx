import React from 'react';

function Cart({ cartItems, onRemove }) {
    const totalPrice = cartItems.reduce((sum, item) => {
        const itemPrice = item.selectedVariation ? item.selectedVariation.price : item.price;
        return sum + itemPrice * item.quantity;
    }, 0);

    if (cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-[var(--tg-theme-hint-color)]">
                <span className="text-4xl mb-2 opacity-50">🛒</span>
                <p>Your cart is empty</p>
            </div>
        );
    }

    return (
        <div className="space-y-2 pb-24 px-2">
            {cartItems.map((item) => (
                <div key={item.cartId} className="flex bg-[var(--tg-theme-bg-color)] p-2 rounded-xl shadow-sm gap-3">
                    {/* Item Image */}
                    <div className="w-20 h-20 bg-[var(--tg-theme-secondary-bg-color)] rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.images && item.images.length > 0 ? (
                            <img src={item.images[0]} alt={item.title} className="max-w-full max-h-full object-contain" />
                        ) : (
                            <span className="text-2xl opacity-20 grayscale">📦</span>
                        )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div>
                            <div className="flex justify-between items-start gap-2">
                                <div>
                                    <h4 className="font-medium text-[var(--tg-theme-text-color)] text-sm leading-snug line-clamp-2">
                                        {item.title}
                                    </h4>
                                    {item.selectedVariation && (
                                        <p className="text-xs text-[var(--tg-theme-hint-color)] mt-0.5">
                                            {item.selectedVariation.name}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => onRemove(item)}
                                    className="text-[var(--tg-theme-hint-color)] p-1 -mr-1 -mt-1 active:text-red-500"
                                >
                                    <span className="text-xs">✕</span>
                                </button>
                            </div>

                            <div className="text-base font-bold text-[var(--tg-theme-text-color)] mt-1">
                                {Math.floor(item.selectedVariation ? item.selectedVariation.price : item.price)} <span className="text-xs font-normal text-[var(--tg-theme-hint-color)]">Birr</span>
                            </div>
                        </div>


                    </div>
                </div>
            ))}
        </div>
    );
}

export default Cart;
