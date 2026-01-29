import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { trackEvent } from '../utils/track';

// Debounce timer for cart sync
let syncTimer = null;

const syncCartToBackend = (cart) => {
    if (syncTimer) clearTimeout(syncTimer);

    syncTimer = setTimeout(() => {
        const initData = window.Telegram?.WebApp?.initData;
        if (!initData) return;

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        fetch(`${API_URL}/api/cart/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': initData
            },
            body: JSON.stringify({ cart })
        }).catch(err => console.error("Cart Sync Failed:", err));
    }, 2000); // 2 second debounce
};

const useStore = create(
    persist(
        (set, get) => ({
            cart: [],
            wishlist: [],
            settings: {},

            // User Data & Gamification
            user: null,
            walletBalance: 0,
            checkInStreak: 0,

            // Actions
            fetchUserData: async () => {
                try {
                    const initData = window.Telegram?.WebApp?.initData;
                    if (!initData) return;

                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

                    const res = await fetch(`${API_URL}/api/user/me`, {
                        headers: { 'Authorization': initData }
                    });

                    if (res.ok) {
                        const data = await res.json();
                        if (data.success) {
                            set({
                                user: data.user,
                                walletBalance: data.user.walletBalance,
                                checkInStreak: data.user.checkInStreak
                            });
                        }
                    }
                } catch (e) {
                    console.error("Failed to fetch user data:", e);
                }
            },

            setWalletBalance: (amount) => set({ walletBalance: amount }),

            fetchSettings: async () => {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                    const res = await fetch(`${API_URL}/api/settings`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.success) {
                            set({ settings: data.settings });
                        }
                    }
                } catch (e) {
                    console.error("Failed to fetch settings:", e);
                }
            },

            addToCart: (product) => {
                const { cart } = get();
                // Determine if this exact item (same ID and same variation) exists
                const existingItem = cart.find(item =>
                    item.id === product.id &&
                    // Use optional chaining carefully. If both lack selectedVariation, they match.
                    (item.selectedVariation?.name === product.selectedVariation?.name)
                );

                let newCart;

                if (existingItem) {
                    newCart = cart.map(item =>
                        (item.id === product.id && item.selectedVariation?.name === product.selectedVariation?.name)
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                } else {
                    const cartId = Date.now() + Math.random().toString(36).substr(2, 9);
                    newCart = [...cart, { ...product, quantity: 1, cartId }];
                }

                set({ cart: newCart });
                syncCartToBackend(newCart);

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
                const { cart } = get();
                const newCart = cart.filter((item) => item.cartId !== cartId);

                set({ cart: newCart });
                syncCartToBackend(newCart);

                if (window.Telegram?.WebApp?.HapticFeedback) {
                    window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                }
            },

            clearCart: () => {
                set({ cart: [] });
                syncCartToBackend([]);
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
            partialize: (state) => ({ cart: state.cart, wishlist: state.wishlist, user: state.user, settings: state.settings }), // Persist settings too
        }
    )
);

export default useStore;
