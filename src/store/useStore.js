import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { trackEvent } from '../utils/track';

const useStore = create(
    persist(
        (set, get) => ({
            cart: [],
            wishlist: [],

            // Actions
            addToCart: (product) => {
                const { cart } = get();
                const cartId = Date.now() + Math.random().toString(36).substr(2, 9);
                const newItem = { ...product, quantity: 1, cartId };

                set({ cart: [...cart, newItem] });

                // Side Effects
                if (window.Telegram?.WebApp?.HapticFeedback) {
                    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                }
                trackEvent('add_to_cart', {
                    productId: product.id,
                    productTitle: product.title,
                    price: product.price
                });
            },

            removeFromCart: (cartId) => {
                set((state) => ({
                    cart: state.cart.filter((item) => item.cartId !== cartId)
                }));

                if (window.Telegram?.WebApp?.HapticFeedback) {
                    window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                }
            },

            clearCart: () => {
                set({ cart: [] });
            },

            toggleWishlist: (productId) => {
                set((state) => {
                    const exists = state.wishlist.includes(productId);
                    const newWishlist = exists
                        ? state.wishlist.filter((id) => id !== productId)
                        : [...state.wishlist, productId];

                    if (window.Telegram?.WebApp?.HapticFeedback) {
                        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                    }

                    return { wishlist: newWishlist };
                });
            },

            // Helper to get cart count
            getCartCount: () => get().cart.reduce((total, item) => total + item.quantity, 0),

            // Helper to get total price
            getCartTotal: () => get().cart.reduce((sum, item) => {
                const price = item.selectedVariation ? item.selectedVariation.price : item.price;
                return sum + (price * item.quantity);
            }, 0)
        }),
        {
            name: 'telegram-store-storage', // unique name
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' check is used
            partialize: (state) => ({ cart: state.cart, wishlist: state.wishlist }), // Only persist these
        }
    )
);

export default useStore;
