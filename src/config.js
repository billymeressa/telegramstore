const API_URL = import.meta.env.VITE_API_URL || '';

if (!API_URL) {
    console.warn('WARNING: VITE_API_URL is missing! Requests will fail in production.');
}

export default API_URL;

console.log('--- CONFIG LOADED ---');
console.log('API_URL:', API_URL);

