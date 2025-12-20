import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// POST /api/ai/analyze - Generate market analysis using Gemini
router.post('/analyze', async (req, res) => {
    try {
        const { formData, metrics, logicSteps } = req.body;

        // Validate input
        if (!formData || !metrics) {
            return res.status(400).json({ message: 'Missing required data' });
        }

        // Check for API Key (server-side only)
        const API_KEY = process.env.GEMINI_API_KEY;
        if (!API_KEY) {
            console.error("Missing GEMINI_API_KEY in environment");
            return res.status(500).json({ 
                message: 'AI service not configured',
                isMock: true 
            });
        }

        // Initialize GenAI
        const genAI = new GoogleGenerativeAI(API_KEY);

        // Construct the Prompt Context
        const context = `
        Analyze this startup opportunity as a Venture Capital Analyst.
        
        PRODUCT_NAME: ${formData.productName}
        VALUE_PROP: ${formData.valueProposition}
        INDUSTRY: ${formData.industry}
        CUSTOMER_TYPE: ${formData.customerType}
        GEOGRAPHY: ${formData.geography}
        PRICING: $${formData.price} (${formData.pricingModel})
        
        CALCULATED_MARKET_SIZE:
        - TAM: $${metrics.tam.toLocaleString()}
        - SAM: $${metrics.sam.toLocaleString()}
        - SOM: $${metrics.som.toLocaleString()}
        
        CALCULATION_LOGIC_USED:
        ${(logicSteps || []).join('\n')}
        `;

        // Define the Prompt
        const prompt = `
        ${context}

        TASK:
        1. Critically evaluate the provided baseline market size.
        2. Suggest MORE ACCURATE market sizing assumptions based on your knowledge of the specific industry and geography.
        3. Provide a qualitative analysis.
        
        OUTPUT JSON FORMAT ONLY:
        {
          "suggestedAssumptions": {
              "avgPrice": <Estimated annual value per customer in USD as a number>,
              "totalAddressableUsers": <Estimated total potential customers in target geography as a number>,
              "marketReach": <SAM percentage (0-100) as a number>,
              "marketShare": <SOM percentage (0-100) as a number>
          },
          "executiveSummary": "2 punchy sentences summarizing the opportunity.",
          "marketDrivers": ["Trend 1", "Trend 2", "Trend 3"],
          "risks": ["Risk 1", "Risk 2"],
          "sanityCheck": "One of: 'Conservative', 'Realistic', or 'Optimistic'",
          "sanityCheckReason": "1 sentence explaining why based on the industry benchmarks."
        }
        `;

        // Retry Logic with Model Fallback
        const modelsToTry = [
            'gemini-2.5-flash',
            'gemini-2.5-pro',
            'gemini-2.0-flash',
            'gemini-1.5-flash'
        ];
        let errors = [];

        for (const modelName of modelsToTry) {
            let retries = 1;
            while (retries >= 0) {
                try {
                    console.log(`🤖 Attempting AI with model: ${modelName}`);
                    const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1beta' });

                    const result = await model.generateContent(prompt);
                    const response = await result.response;
                    const text = response.text();

                    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
                    const parsed = JSON.parse(jsonStr);
                    
                    return res.json(parsed);

                } catch (error) {
                    console.warn(`AI Failed (${modelName}):`, error.message);
                    errors.push(`${modelName}: ${error.message}`);

                    if (error.message.includes('404') || error.message.includes('not found')) {
                        break;
                    }

                    if (error.message.includes('429')) {
                        await delay(1000);
                    }

                    retries--;
                }
            }
        }

        // All models failed - return mock response
        console.warn("All AI models failed.", { errors });
        return res.status(503).json({
            isMock: true,
            userMessage: "Gemini is temporarily unavailable. Please try again later.",
            executiveSummary: "Gemini is temporarily unavailable. Please try again later.",
            suggestedAssumptions: {
                avgPrice: metrics.tam / 100000,
                totalAddressableUsers: metrics.tam / 500,
                marketReach: 20,
                marketShare: 2
            },
            marketDrivers: [
                "Cloud Adoption Trends",
                "AI Integration Growth",
                "Remote Work Expansion"
            ],
            risks: [
                "Market Competition",
                "Regulatory Changes"
            ],
            sanityCheck: "Demo",
            sanityCheckReason: "This is a placeholder analysis because the AI service is temporarily unavailable."
        });

    } catch (error) {
        console.error('AI Analysis Error:', error);
        res.status(500).json({ message: 'AI analysis failed', error: error.message });
    }
});

export default router;
