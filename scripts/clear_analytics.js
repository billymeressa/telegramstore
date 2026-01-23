import 'dotenv/config';
import { connectDB, AnalyticsEvent, Session } from '../src/db.js';

// Clear all analytics data
async function clearAnalytics() {
    await connectDB();

    console.log('Clearing all analytics data...');

    const eventsDeleted = await AnalyticsEvent.deleteMany({});
    console.log(`✅ Deleted ${eventsDeleted.deletedCount} analytics events`);

    const sessionsDeleted = await Session.deleteMany({});
    console.log(`✅ Deleted ${sessionsDeleted.deletedCount} sessions`);

    console.log('✅ All dummy data cleared!');
    console.log('Analytics will now show real data only.');

    process.exit(0);
}

clearAnalytics().catch(err => {
    console.error('Error clearing analytics:', err);
    process.exit(1);
});
