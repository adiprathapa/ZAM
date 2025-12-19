import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Industry from '../models/Industry.js';
import Company from '../models/Company.js';
import SystemConstant from '../models/SystemConstant.js';
import { INDUSTRY_DATA, COMPANY_DATA, CONSTANTS_DATA } from './data.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zam';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB for Seeding'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);
    });

const seedDB = async () => {
    try {
        // Clear existing data
        await Industry.deleteMany({});
        await Company.deleteMany({});
        await SystemConstant.deleteMany({});
        console.log('🧹 Cleared existing data');

        // Insert new data
        await Industry.insertMany(INDUSTRY_DATA);
        await Company.insertMany(COMPANY_DATA);
        await SystemConstant.insertMany(CONSTANTS_DATA);

        console.log('🌱 Database seeded successfully');
        console.log(`   - ${INDUSTRY_DATA.length} Industries`);
        console.log(`   - ${COMPANY_DATA.length} Companies`);
        console.log(`   - ${CONSTANTS_DATA.length} Constant Lists`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding Error:', err);
        process.exit(1);
    }
};

seedDB();
