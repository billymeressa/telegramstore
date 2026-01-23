import 'dotenv/config';
import { connectDB, AnalyticsEvent, Session } from '../src/db.js';

// Seed sample analytics data for testing
async function seedAnalytics() {
    await connectDB();

    console.log('Seeding sample analytics data...');

    const userId = '123456789'; // Sample user ID
    const now = new Date();

    // Create events for the last 7 days
    const events = [];
    const sessions = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(10, 0, 0, 0);

        // Random number of events per day
        const appOpens = Math.floor(Math.random() * 10) + 5;
        const viewProducts = Math.floor(Math.random() * 20) + 10;
        const addToCarts = Math.floor(Math.random() * 5) + 2;

        // App opens
        for (let j = 0; j < appOpens; j++) {
            events.push({
                userId: `user${j % 3}`,
                eventType: 'app_open',
                timestamp: new Date(date.getTime() + j * 3600000)
            });
        }

        // Product views
        for (let j = 0; j < viewProducts; j++) {
            events.push({
                userId: `user${j % 3}`,
                eventType: 'view_product',
                metadata: {
                    productId: Math.floor(Math.random() * 10) + 1,
                    productTitle: `Sample Product ${Math.floor(Math.random() * 10) + 1}`
                },
                timestamp: new Date(date.getTime() + j * 1800000)
            });
        }

        // Add to carts
        for (let j = 0; j < addToCarts; j++) {
            events.push({
                userId: `user${j % 3}`,
                eventType: 'add_to_cart',
                metadata: {
                    productId: Math.floor(Math.random() * 10) + 1,
                    price: Math.floor(Math.random() * 1000) + 100
                },
                timestamp: new Date(date.getTime() + j * 2400000)
            });
        }

        // Create sessions
        for (let j = 0; j < appOpens; j++) {
            const startTime = new Date(date.getTime() + j * 3600000);
            const duration = Math.floor(Math.random() * 300) + 60; // 1-5 minutes
            const endTime = new Date(startTime.getTime() + duration * 1000);

            sessions.push({
                userId: `user${j % 3}`,
                startTime,
                endTime,
                duration,
                isActive: false
            });
        }
    }

    // Insert all events
    await AnalyticsEvent.insertMany(events);
    console.log(`✅ Inserted ${events.length} analytics events`);

    // Insert all sessions
    await Session.insertMany(sessions);
    console.log(`✅ Inserted ${sessions.length} sessions`);

    console.log('✅ Sample data seeded successfully!');
    console.log('You can now view the Analytics Dashboard');

    process.exit(0);
}

seedAnalytics().catch(err => {
    console.error('Error seeding analytics:', err);
    process.exit(1);
});
