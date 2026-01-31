import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = 'G-PLACEHOLDER'; // User to replace this with actual ID

/**
 * Initialize Google Analytics 4
 */
export const initGA = () => {
    if (GA_MEASUREMENT_ID !== 'G-PLACEHOLDER') {
        ReactGA.initialize(GA_MEASUREMENT_ID);
    } else {
        console.warn('GA4: Measurement ID not set. Events will not be sent.');
    }
};

/**
 * Log a page view event
 */
export const logPageView = () => {
    ReactGA.send({ hitType: 'pageview', page: window.location.pathname });
};

/**
 * Log a generic event
 * @param {string} category 
 * @param {string} action 
 * @param {string} label 
 */
export const logEvent = (category, action, label) => {
    ReactGA.event({
        category,
        action,
        label
    });
};

// --- E-commerce Events ---

/**
 * Track when a user views a product
 * @param {object} product - Product object
 */
export const logViewItem = (product) => {
    ReactGA.event('view_item', {
        currency: 'ETB',
        value: product.price,
        items: [{
            item_id: product._id || product.id,
            item_name: product.title,
            price: product.price,
            item_category: product.category,
            quantity: 1
        }]
    });
};

/**
 * Track when a user adds a product to cart
 * @param {object} product - Product object
 */
export const logAddToCart = (product) => {
    ReactGA.event('add_to_cart', {
        currency: 'ETB',
        value: product.price,
        items: [{
            item_id: product._id || product.id,
            item_name: product.title,
            price: product.price,
            item_category: product.category,
            quantity: 1
        }]
    });
};

/**
 * Track when a user begins checkout
 * @param {Array} cartItems - List of items in cart
 * @param {number} totalValue - Total checkout value
 */
export const logBeginCheckout = (cartItems, totalValue) => {
    ReactGA.event('begin_checkout', {
        currency: 'ETB',
        value: totalValue,
        items: cartItems.map(item => ({
            item_id: item._id || item.id,
            item_name: item.title,
            price: item.price,
            item_category: item.category,
            quantity: item.quantity
        }))
    });
};

/**
 * Track a successful purchase
 * @param {string} transactionId - Unique order ID
 * @param {number} value - Total revenue
 * @param {Array} items - Purchased items
 */
export const logPurchase = (transactionId, value, items) => {
    ReactGA.event('purchase', {
        transaction_id: transactionId,
        currency: 'ETB',
        value: value,
        items: items.map(item => ({
            item_id: item._id || item.id,
            item_name: item.title,
            price: item.price,
            quantity: item.quantity
        }))
    });
};
