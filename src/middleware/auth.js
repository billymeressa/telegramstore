import crypto from 'crypto';
import 'dotenv/config';

const verifyTelegramWebAppData = (req, res, next) => {
    // 1. Get InitData from Header
    const initData = req.headers.authorization;

    if (!initData) {
        return res.status(401).json({ error: 'Unauthorized: No initData provided' });
    }

    // 2. Parse and Validate
    // Telegram initData is a query string: "auth_date=...&query_id=...&user=..."
    // Validation algorithm: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app

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
        // HMAC-SHA256 signature of the bot token with the constant string "WebAppData" used as a key.
        const secretKey = crypto.createHmac('sha256', 'WebAppData')
            .update(process.env.BOT_TOKEN)
            .digest();

        // Calculate Hash
        const calculatedHash = crypto.createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');

        // Check Validity
        if (calculatedHash !== hash) {
            return res.status(403).json({ error: 'Forbidden: Invalid signature', details: 'The data has been tampered with.' });
        }

        // 3. Check Admin Access
        const userDataStr = urlParams.get('user');
        if (!userDataStr) {
            return res.status(403).json({ error: 'Forbidden: No user data found' });
        }

        const user = JSON.parse(userDataStr);
        const adminId = parseInt(process.env.ADMIN_ID);
        const adminIds = [
            process.env.ADMIN_ID,
            ...(process.env.ADMIN_IDS || '').split(',')
        ]
            .map(id => (id || '').toString().trim())
            .filter(id => id && !isNaN(parseInt(id)))
            .map(id => parseInt(id));

        // Allow if user.id is in adminIds list
        const isAdmin = adminIds.includes(user.id);

        if (!isAdmin) {
            return res.status(403).json({ error: 'Forbidden: You are not an admin', userId: user.id });
        }

        // Attach user to request for further use
        req.telegramUser = user;
        next();

    } catch (e) {
        console.error("Auth Error:", e);
        return res.status(500).json({ error: 'Internal Server Error during authentication' });
    }
};

export default verifyTelegramWebAppData;
