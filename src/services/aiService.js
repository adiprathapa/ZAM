import { GoogleGenerativeAI } from "@google/generative-ai";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateMarketNarrative(formData, metrics, logicSteps) {
    // Check for API Key
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY) {
        console.error("Missing VITE_GEMINI_API_KEY in .env file");
        throw new Error("API Key missing. Please check .env configuration.");
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
    ${logicSteps.join('\n')}
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
    // User confirmed access to gemini-2.5-flash
    const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'];
    let lastError;

    for (const modelName of modelsToTry) {
        let retries = 2; // Retry per model
        while (retries > 0) {
            try {
                console.log(`🤖 Attempting AI with model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                // Clean Markdown formatting if present
                const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

                return JSON.parse(jsonStr);

            } catch (error) {
                console.warn(`AI Failed (${modelName}):`, error.message);
                lastError = error;

                // If the model itself is not found (404), do not retry this model, switch to next.
                if (error.message.includes('404') || error.message.includes('not found')) {
                    break;
                }

                if (error.message.includes('429')) {
                    await delay(2000); // Wait for rate limit
                }

                retries--;
                await delay(1000);
            }
        }
    }

    // FALLBACK: If all AI attempts fail, return a Mock/Demo response so the user isn't stuck.
    console.warn("⚠️ All AI models failed. Switching to DEMO MODE.");
    return {
        isMock: true, // Flag to show in UI
        suggestedAssumptions: {
            avgPrice: metrics.tam / 100000,
            totalAddressableUsers: metrics.tam / 500,
            marketReach: 20,
            marketShare: 2
        },
        executiveSummary: "⚠️ [DEMO MODE] The AI API Key (gemini-1.5-flash) returned a 404 error. This usually means the 'Generative Language API' is not enabled in your Google Cloud Console.",
        marketDrivers: [
            "Demonstration Driver 1: Cloud Adoption",
            "Demonstration Driver 2: AI Integration",
            "Demonstration Driver 3: Remote Work Trends"
        ],
        risks: [
            "API Key Configuration Issue",
            "Verify Google Cloud Billing is enabled (if using Pro)",
            "Check API Quotas"
        ],
        sanityCheck: "Demo",
        sanityCheckReason: "This is a placeholder analysis because the live AI service is unreachable."
    };
}
