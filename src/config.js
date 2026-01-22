const API_URL = import.meta.env.VITE_API_URL || '';

if (!API_URL) {
    console.warn('WARNING: VITE_API_URL is missing! Requests will fail in production.');
}

export const SELLER_USERNAME = import.meta.env.VITE_SELLER_USERNAME || 'AddisStoreSupport';

export default API_URL;
