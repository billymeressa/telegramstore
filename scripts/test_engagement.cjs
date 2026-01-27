
const mongoose = require('mongoose');
require('dotenv').config();

const API_URL = 'http://localhost:3000';
const USER_ID = 'test_user_' + Date.now();

// Schema definition for seeding
const UserSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String },
    firstName: { type: String },
    lastSpinTime: { type: Date },
    checkInStreak: { type: Number, default: 0 },
    lastCheckInTime: { type: Date }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function testDailyEngagement() {
    console.log(`Testing with User ID: ${USER_ID}`);

    // CONNECT TO DB
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB for Seeding');
    } catch (e) {
        console.error("DB Connection Failed:", e);
        return;
    }

    // SEED USER
    try {
        await User.create({
            userId: USER_ID,
            username: 'TestUser',
            firstName: 'Tester'
        });
        console.log('User Seeded');
    } catch (e) {
        console.error("User Seeding Failed:", e);
        return;
    }

    // 1. Test Daily Check-in
    console.log('\n--- Testing Daily Check-in ---');
    try {
        const res1 = await fetch(`${API_URL}/api/daily-checkin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: USER_ID })
        });
        const data1 = await res1.json();
        console.log('Check-in 1 (Expect Success, Streak 1):', data1);

        if (data1.streak !== 1) console.error('FAILED: Streak should be 1');

        // Try checking in again immediately
        const res2 = await fetch(`${API_URL}/api/daily-checkin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: USER_ID })
        });
        const data2 = await res2.json();
        console.log('Check-in 2 (Expect "Already checked in"):', data2);

        if (data2.success !== false) console.error('FAILED: Should prevent double check-in');

    } catch (e) {
        console.error('Check-in Error:', e.message);
    }

    // 2. Test Spin Wheel
    console.log('\n--- Testing Spin Wheel ---');
    try {
        const res1 = await fetch(`${API_URL}/api/game/spin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: USER_ID })
        });
        const data1 = await res1.json();
        console.log('Spin 1 (Expect Success):', data1);

        // Try spinning again
        const res2 = await fetch(`${API_URL}/api/game/spin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: USER_ID })
        });
        const data2 = await res2.json();
        console.log('Spin 2 (Expect "Come back tomorrow"):', data2);

        if (data2.success !== false) console.error('FAILED: Should prevent double spin');

    } catch (e) {
        console.error('Spin Error:', e.message);
    }

    // CLEANUP
    console.log('\n--- Cleaning Up ---');
    await User.deleteOne({ userId: USER_ID });
    await mongoose.connection.close();

    console.log('\n--- Test Complete ---');
}

testDailyEngagement();
