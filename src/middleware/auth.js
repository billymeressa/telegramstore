import { createHmac } from 'node:crypto';
import 'dotenv/config';

// 1. Base Authentication (HMAC Validation)
const authenticateUser = (req, res, next) => {
    // Get InitData from Header
    const initData = req.headers.authorization;

    if (!initData) {
        return res.status(401).json({ error: 'Unauthorized: No initData provided' });
    }

    try {
        const urlParams = new URLSearchParams(initData);
        const hash = urlParams.get('hash');

        if (!hash) {
            return res.status(401).json({ error: 'Unauthorized: No hash provided' });
        }

        urlParams.delete('hash');

        // Sort keys alphabetically
        const dataCheckString = Array.from(urlParams.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');

        // Create Secret Key
        const secretKey = createHmac('sha256', 'WebAppData')
            .update(process.env.BOT_TOKEN)
            .digest();

        // Calculate Hash
        const calculatedHash = createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');

        // Check Validity
        if (calculatedHash !== hash) {
            return res.status(403).json({ error: 'Forbidden: Invalid signature' });
        }

        // Parse User Data
        const userDataStr = urlParams.get('user');
        if (!userDataStr) {
            return res.status(403).json({ error: 'Forbidden: No user data found' });
        }

        const user = JSON.parse(userDataStr);
        req.telegramUser = user; // Attach user to request
        next();

    } catch (e) {
        console.error("Auth Error:", e);
        return res.status(500).json({ error: 'Internal Authentication Error' });
    }
};

// 2. Admin Authorization (Depends on authenticateUser)
const requireAdmin = (req, res, next) => {
    if (!req.telegramUser) {
        return res.status(500).json({ error: 'Server Error: Auth middleware missing' });
    }

    const adminIds = [
        process.env.ADMIN_ID,
        process.env.SELLER_ID,
        ...(process.env.ADMIN_IDS || '').split(',')
    ]
        .map(id => (id || '').toString().trim())
        .filter(id => id && !isNaN(parseInt(id)))
        .map(id => parseInt(id));

    if (!adminIds.includes(req.telegramUser.id)) {
        return res.status(403).json({ error: 'Forbidden: Admin access required', userId: req.telegramUser.id });
    }

    next();
};

export { authenticateUser, requireAdmin };

