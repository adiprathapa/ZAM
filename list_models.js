import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

// Initialize the Gemini API
const apiKey = process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.error('API Key not found in environment');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        // For listing models, we don't need a specific model instance
        // Note: The SDK doesn't expose listModels directly on the main class easily in all versions, 
        // but the error message suggested calling it. 
        // Actually, in the Node SDK, it's often unavailable directly or requires a specific manager.
        // Let's try to just hit the API endpoint using fetch to be 100% sure what the KEY sees.

        // Using standard fetch to debug raw API access
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error('API Error:', JSON.stringify(data.error, null, 2));
            return;
        }

        console.log('Available Models:');
        if (data.models) {
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log('No models found in response:', data);
        }

    } catch (error) {
        console.error('Script Error:', error);
    }
}

listModels();
