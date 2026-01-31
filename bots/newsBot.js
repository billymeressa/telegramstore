/**
 * 📰 News Bot Module
 * 
 * This module contains the logic for the News Bot.
 * It is designed to be modular:
 * - Can be loaded by the main bot.js (Shared Server)
 * - Can be run independently in the future (Standalone)
 * 
 * @param {import('telegraf').Telegraf} bot - The Telegraf instance
 */
export default function setupNewsBot(bot) {

    // --- State (In-Memory for now, can use DB later) ---
    // In a real app, you'd fetch this from the database
    const subscribers = new Set();

    // --- Commands ---

    bot.command('start', (ctx) => {
        ctx.reply(
            `📰 *Welcome to the News Bot!* \n\n` +
            `I deliver the latest headlines straight to your chat.\n\n` +
            `Commands:\n` +
            `/subscribe - Get daily news updates\n` +
            `/latest - Get the latest news now\n` +
            `/help - Show this menu`,
            { parse_mode: 'Markdown' }
        );
    });

    bot.command('help', (ctx) => {
        ctx.reply(
            `🛠 *Help Menu*\n\n` +
            `/start - Restart the bot\n` +
            `/subscribe - Subscribe to updates\n` +
            `/unsubscribe - Stop receiving updates\n` +
            `/latest - Fetch latest news manually`,
            { parse_mode: 'Markdown' }
        );
    });

    bot.command('subscribe', (ctx) => {
        const userId = ctx.from.id;
        if (subscribers.has(userId)) {
            ctx.reply("✅ You are already subscribed!");
        } else {
            subscribers.add(userId);
            ctx.reply("🎉 Subscribed! You will now receive news updates.");
            console.log(`[NewsBot] New subscriber: ${userId}`);
        }
    });

    bot.command('unsubscribe', (ctx) => {
        const userId = ctx.from.id;
        if (subscribers.has(userId)) {
            subscribers.delete(userId);
            ctx.reply("👋 Unsubscribed. You won't receive further updates.");
            console.log(`[NewsBot] Unsubscribed: ${userId}`);
        } else {
            ctx.reply("ℹ️ You were not subscribed.");
        }
    });

    bot.command('latest', (ctx) => {
        // Mock News Data (Replace with API call later, e.g., NewsAPI or RSS)
        const mockNews = [
            "🚀 *Tech*: New AI model breaks speed records.",
            "🌍 *World*: Global climate summit ends with new agreement.",
            "⚽ *Sport*: Championship finals set for next weekend."
        ];

        const newsFeed = mockNews.join('\n\n');
        ctx.reply(`📢 *Latest Headlines:*\n\n${newsFeed}`, { parse_mode: 'Markdown' });
    });

    // --- Admin Broadcast (Simulated) ---
    // This function could be exposed or triggered by an admin command
    bot.command('broadcast_news', (ctx) => {
        // Simple security check (replace with real admin check)
        // if (ctx.from.id !== YOUR_ADMIN_ID) return; 

        if (subscribers.size === 0) {
            return ctx.reply("No subscribers to broadcast to.");
        }

        const message = ctx.message.text.split(' ').slice(1).join(' ');
        if (!message) return ctx.reply("Usage: /broadcast_news <message>");

        let count = 0;
        subscribers.forEach(userId => {
            bot.telegram.sendMessage(userId, `📰 *Breaking News:*\n\n${message}`, { parse_mode: 'Markdown' })
                .catch(err => console.error(`Failed to send to ${userId}`, err));
            count++;
        });

        ctx.reply(`✅ Broadcast sent to ${count} subscribers.`);
    });

    console.log("✅ News Bot Logic Loaded.");
}
