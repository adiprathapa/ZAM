import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure dotenv to read from the root .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("❌ No API Key found in .env file!");
    process.exit(1);
}

console.log(`🔑 Testing API Key: ${API_KEY.substring(0, 5)}...`);

const genAI = new GoogleGenerativeAI(API_KEY);
const modelsToTest = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

async function listAvailableModels() {
    console.log("----------------------------------------");
    console.log("🔍 Testing User-Specified Models...");

    for (const modelName of modelsToTest) {
        process.stdout.write(`👉 Testing [${modelName}] ... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Test");
            const response = await result.response;
            console.log("✅ SUCCESS!");
            return; // Exit on first success
        } catch (err) {
            console.log("❌ FAILED");
            // console.log(`   Reason: ${err.message.split(':')[0]}`);
        }
    }

    console.log("\n❌ ALL models failed. The API Key appears valid but cannot access these models.");
    console.log("   Most likely cause: 'Generative Language API' is not enabled in Google Cloud Console.");
}

listAvailableModels();
