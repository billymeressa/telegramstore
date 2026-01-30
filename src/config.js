const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// Auto-correct common malformed URL patterns (e.g. missing colon which might happen in some env overwrites)
const API_URL = rawUrl.replace('https//', 'https://').replace('http//', 'http://');

if (!import.meta.env.VITE_API_URL) {
    console.warn('WARNING: VITE_API_URL is missing! Defaulting to http://localhost:3000');
}

export default API_URL;

console.log('--- CONFIG LOADED ---');
console.log('API_URL:', API_URL);
