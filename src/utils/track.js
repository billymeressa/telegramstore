import API_URL from '../config';

/**
 * Tracks a user event by sending it to the backend.
 * @param {string} eventType - The name of the event (e.g., 'app_open', 'view_product', 'add_to_cart')
 * @param {object} metadata - Optional additional data (e.g., { productId: 123, price: 500 })
 */
export const trackEvent = async (eventType, metadata = {}) => {
    // Only track if we are in a Telegram Web App context and have a user
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;

    // Optional: You could allow tracking for anonymous web users if you wanted, 
    // but for now let's focus on Telegram users.
    if (!user) return;

    try {
        await fetch(`${API_URL}/api/track`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: user.id.toString(),
                eventType,
                metadata
            })
        });
    } catch (e) {
        // Silently fail to not disrupt user experience
        console.warn("Analytics tracking failed:", e);
    }
};

/**
 * Starts a new session for the user
 */
export const startSession = async () => {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (!user) return;

    try {
        await fetch(`${API_URL}/api/session/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: user.id.toString()
            })
        });
    } catch (e) {
        console.warn("Session start failed:", e);
    }
};

/**
 * Ends the current session for the user
 */
export const endSession = async () => {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (!user) return;

    try {
        await fetch(`${API_URL}/api/session/end`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: user.id.toString()
            })
        });
    } catch (e) {
        console.warn("Session end failed:", e);
    }
};
