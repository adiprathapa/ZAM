import express from 'express';
import { retrieveContext, buildRetrievalQuery } from '../rag/retriever.js';

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
        const GROQ_API_KEY = process.env.GROQ_API_KEY;
        if (!GROQ_API_KEY) {
            console.error("Missing GROQ_API_KEY in environment");
            return res.status(500).json({
                message: 'AI service not configured',
                isMock: true
            });
        }

        let retrieved = { results: [], grounded: false };
        try {
            const retrievalQuery = buildRetrievalQuery(formData, metrics);
            retrieved = await retrieveContext(retrievalQuery, {
                industryKey: formData.industry,
                topK: 5
            });
        } catch (ragError) {
            console.warn('RAG retrieval failed, proceeding ungrounded:', ragError.message);
        }

        const groundingBlock = retrieved.results.length
            ? retrieved.results
                .map((r, i) => `[${i + 1}] (${r.source}) ${r.text}`)
                .join('\n')
            : 'No grounding data available.';

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

        RETRIEVED_KNOWLEDGE_BASE (industry benchmarks, comparable companies, and ZAM sizing methodology — ground your analysis in these facts and prefer them over general assumptions):
        ${groundingBlock}
        `;

        // Define the Prompt
        const prompt = `
        ${context}

        TASK:
        1. Critically evaluate the provided baseline market size against the RETRIEVED_KNOWLEDGE_BASE.
        2. Suggest MORE ACCURATE market sizing assumptions, grounded in the retrieved industry benchmarks and comparable companies above. Cite specific comparables or benchmarks where relevant.
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
            'llama-3.3-70b-versatile',
            'llama-3.1-8b-instant'
        ];
        let errors = [];

        for (const modelName of modelsToTry) {
            let retries = 1;
            while (retries >= 0) {
                try {
                    console.log(`Attempting AI with model: ${modelName}`);
                    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${GROQ_API_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            model: modelName,
                            messages: [
                                { role: 'system', content: 'You are a venture capital analyst. Respond only with valid JSON matching the requested schema.' },
                                { role: 'user', content: prompt }
                            ],
                            response_format: { type: 'json_object' },
                            temperature: 0.4
                        })
                    });

                    if (!groqResponse.ok) {
                        const errText = await groqResponse.text();
                        throw new Error(`${groqResponse.status} ${errText}`);
                    }

                    const data = await groqResponse.json();
                    const text = data.choices?.[0]?.message?.content || '';
                    const parsed = JSON.parse(text);

                    parsed.grounded = retrieved.grounded;
                    parsed.sources = retrieved.results.map((r) => ({
                        source: r.source,
                        type: r.type,
                        similarity: r.similarity
                    }));

                    return res.json(parsed);

                } catch (error) {
                    console.warn(`AI Failed (${modelName}):`, error.message);
                    errors.push(`${modelName}: ${error.message}`);

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
            userMessage: "The AI service is temporarily unavailable. Please try again later.",
            executiveSummary: "The AI service is temporarily unavailable. Please try again later.",
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
