import cron from 'node-cron';
import { User, PromoCode } from '../db.js';

const initScheduler = (bot) => {
    console.log('📅 Initializing Cron Scheduler (Timezone: Africa/Addis_Ababa)...');

    // 1. Daily Re-engagement (Every day at 10:00 AM EAT)
    // UTC+3 => 07:00 UTC
    // Cron format: Minute Hour Day Month DayOfWeek
    cron.schedule('0 10 * * *', async () => {
        console.log('⏰ Running Daily Re-engagement Job...');
        try {
            const now = new Date();
            const INACTIVE_THRESHOLD_DAYS = 7;
            const REENGAGEMENT_COOLDOWN_DAYS = 30;

            const inactiveDate = new Date(now.getTime() - (INACTIVE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000));
            const recentReengagementDate = new Date(now.getTime() - (REENGAGEMENT_COOLDOWN_DAYS * 24 * 60 * 60 * 1000));

            const inactiveUsers = await User.find({
                lastActiveAt: { $lt: inactiveDate },
                $or: [
                    { lastReengagementAt: { $exists: false } },
                    { lastReengagementAt: { $lt: recentReengagementDate } },
                    { lastReengagementAt: null }
                ]
            });

            if (inactiveUsers.length > 0) {
                console.log(`Found ${inactiveUsers.length} inactive users. Sending reminders...`);
                for (const user of inactiveUsers) {
                    try {
                        await bot.telegram.sendMessage(
                            user.userId,
                            `We miss you, ${user.firstName || 'friend'}! 👋\n\n` +
                            `It's been over a week since your last visit. We've added fresh new stock!\n` +
                            `Come take a look.`,
                            {
                                parse_mode: 'Markdown',
                                reply_markup: {
                                    inline_keyboard: [[{ text: "👀 Visit Store", web_app: { url: process.env.WEB_APP_URL } }]]
                                }
                            }
                        );
                        await User.updateOne({ userId: user.userId }, { lastReengagementAt: new Date() });
                    } catch (err) {
                        console.error(`Failed to msg ${user.userId}:`, err.message);
                    }
                }
            }
        } catch (e) {
            console.error("Re-engagement Job Error:", e);
        }
    }, {
        timezone: "Africa/Addis_Ababa"
    });

    // 2. Expire Old Promo Codes (Daily at 00:00 EAT)
    cron.schedule('0 0 * * *', async () => {
        console.log('🧹 Running Promo Code Cleanup...');
        try {
            const result = await PromoCode.updateMany(
                { expiresAt: { $lt: new Date() }, isActive: true },
                { isActive: false }
            );
            if (result.modifiedCount > 0) {
                console.log(`Expired ${result.modifiedCount} promo codes.`);
            }
        } catch (e) {
            console.error("Promo Cleanup Error:", e);
        }
    }, {
        timezone: "Africa/Addis_Ababa"
    });

    // 3. Reset Daily User Limits (Optional - if we stored daily limits in DB)
    // Current logic uses date comparison (lastSpinTime date vs today), so explicit reset isn't strictly needed 
    // unless we change to a simple counter flag. But logging the new day is helpful.
    cron.schedule('0 0 * * *', () => {
        console.log('🌅 New Day Started (EAT)! Daily limits technically refresh now.');
    }, {
        timezone: "Africa/Addis_Ababa"
    });

    console.log('✅ Scheduler active.');
};

export default initScheduler;
