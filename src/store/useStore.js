import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { trackEvent } from '../utils/track';

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

                    // Dynamically import config to avoid circular deps if any, or just fetch directly
                    // Assuming API_URL is needed, but usually we use relative path in prod or env. 
                    // Let's assume relative path /api or from config. 
                    // To be safe, I'll use the one from config.js or relative if served from same origin.
                    // Since frontend sets API_URL, I should probably pass it or assume relative if built.
                    // But for dev, we need the full URL.
                    // I'll skip importing config and try relative '/api/user/me' assuming proxy or same origin, 
                    // OR if I can import config.js let's check imports. 
                    // useStore doesn't import config currently. 
                    // Let's import API_URL at the top if needed. 
                    // WAIT: ReplaceFileContent replaces lines. I can't easily add import at top without potentially breaking if I don't see it.
                    // But I saw the file content, it has `import { trackEvent }`. 
                    // I'll grab API_URL from window or env if available, or hardcode/relative.
                    // Given the environment, let's use a hardcoded fallback or relative.
                    // Actually, let's fetch from `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/user/me`

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
            partialize: (state) => ({ cart: state.cart, wishlist: state.wishlist, user: state.user, settings: state.settings }), // Persist settings too
        }
    )
);

export default useStore;
