/**
 * This is an example of an independent bot that can run alongside the main Store Bot.
 * 
 * To use this:
 * 1. Add SECOND_BOT_TOKEN to your .env file
 * 2. The main bot.js will automatically detect it and runs this logic.
 * 
 * @param {import('telegraf').Telegraf} bot - The Telegraf bot instance
 */
export default function setup(bot) {
    bot.command('start', (ctx) => {
        ctx.reply("Hello! I am the Second Bot running on the same server! 🚀");
    });

    bot.on('text', (ctx) => {
        ctx.reply(`You said: ${ctx.message.text}`);
    });

    console.log("Secondary Bot Logic Loaded.");
}
