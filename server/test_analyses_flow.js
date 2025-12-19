import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Analysis from './models/Analysis.js';

// Configure dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ No MongoDB URI found!");
    process.exit(1);
}

async function testAnalysisFlow() {
    console.log("----------------------------------------");
    console.log("🧪 Testing Analysis DB Flow...");

    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // 1. Create Dummy Data
        const testData = {
            productName: "Test Startup " + Date.now(),
            inputs: { industry: "saas", pricingModel: "subscription" },
            metrics: { tam: 100, sam: 50, som: 10 },
            assumptions: { avgPrice: 10, totalAddressableUsers: 100 },
            aiAnalysis: { executiveSummary: "Test Summary", isMock: true }
        };

        // 2. Save
        console.log("📝 Saving Analysis...");
        const analysis = new Analysis(testData);
        await analysis.save();
        console.log("✅ Save Successful: ID " + analysis._id);

        // 3. Retrieve
        console.log("📥 Retrieving List...");
        const list = await Analysis.find().sort({ createdAt: -1 }).limit(1);
        console.log("✅ Retrieved " + list.length + " analyses.");
        console.log("   Top Item: " + list[0].productName);

        if (list[0].productName === testData.productName) {
            console.log("✅ VERIFICATION PASSED: Data matches.");
        } else {
            console.log("❌ VERIFICATION FAILED: Data mismatch.");
        }

        // 4. Cleanup
        await Analysis.findByIdAndDelete(analysis._id);
        console.log("🧹 Cleanup Complete");

    } catch (err) {
        console.error("❌ Test Failed:", err);
    } finally {
        await mongoose.disconnect();
    }
}

testAnalysisFlow();
