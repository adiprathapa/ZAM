import { GoogleGenerativeAI } from '@google/generative-ai';

const EMBEDDING_MODEL = 'gemini-embedding-001';

let cachedClient = null;

function getClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Missing GEMINI_API_KEY in environment');
    }
    if (!cachedClient) {
        cachedClient = new GoogleGenerativeAI(apiKey);
    }
    return cachedClient;
}

async function embed(text, taskType) {
    const model = getClient().getGenerativeModel({ model: EMBEDDING_MODEL });
    const result = await model.embedContent({
        content: { parts: [{ text }] },
        taskType
    });
    return result.embedding.values;
}

export function embedDocument(text) {
    return embed(text, 'RETRIEVAL_DOCUMENT');
}

export function embedQuery(text) {
    return embed(text, 'RETRIEVAL_QUERY');
}

export function cosineSimilarity(a, b) {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
