import 'dotenv/config';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

const testConnections = async () => {
    console.log('\n🔍 STARTING CONNECTION TEST...\n');

    // 1. Check Environment Variables
    const requiredVars = ['MONGODB_URI', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
    const missing = requiredVars.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error('❌ MISSING ENV VARIABES:', missing.join(', '));
        process.exit(1);
    }
    console.log('✅ Environment Variables Present');

    // 2. Test MongoDB Connection
    console.log('⏳ Testing MongoDB Connection...');
    try {
        await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ MongoDB Connected Successfully!');
        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ MongoDB Connection FAILED:');
        console.error(err.message);
        console.log('\n💡 TIP: Check your password/username. Did you use "%23" instead of "#"?');
        process.exit(1);
    }

    // 3. Test Cloudinary Configuration
    console.log('⏳ Testing Cloudinary Configuration...');
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    try {
        const result = await cloudinary.api.ping();
        console.log('✅ Cloudinary Ping Successful:', result);
    } catch (err) {
        console.error('❌ Cloudinary Connection FAILED:');
        console.error(err.message);
    }

    console.log('\n🎉 ALL TESTS COMPLETED');
};

testConnections();
