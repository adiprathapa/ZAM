const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function generateMarketNarrative(formData, metrics, logicSteps) {
    try {
        const response = await fetch(`${API_BASE_URL}/ai/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ formData, metrics, logicSteps }),
        });

        const data = await response.json();

        // Handle service unavailable (503) or other errors
        if (!response.ok) {
            if (data.isMock) {
                // Return the mock data so UI can handle it gracefully
                return data;
            }
            throw new Error(data.message || 'AI analysis failed');
        }

        return data;

    } catch (error) {
        console.error('AI Service Error:', error);
        
        // Return fallback mock response
        return {
            isMock: true,
            userMessage: "AI service is temporarily unavailable. Please try again later.",
            executiveSummary: "AI service is temporarily unavailable.",
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
        };
    }
}
