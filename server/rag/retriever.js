import { buildCorpus } from './corpus.js';

const INDUSTRY_BOOST = 2.0;
const K1 = 1.5;
const B = 0.75;

const STOPWORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'for', 'to', 'of', 'in', 'on', 'with',
    'is', 'are', 'as', 'by', 'at', 'from', 'this', 'that', 'it', 'its', 'per'
]);

function tokenize(text) {
    return (String(text).toLowerCase().match(/[a-z0-9]+/g) || [])
        .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

let indexCache = null;

function getIndex() {
    if (indexCache) return indexCache;

    const docs = buildCorpus().map((chunk) => {
        const tokens = tokenize(chunk.text);
        const tf = new Map();
        for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
        return { ...chunk, tokens, tf, length: tokens.length };
    });

    const n = docs.length;
    const df = new Map();
    for (const doc of docs) {
        for (const t of new Set(doc.tokens)) df.set(t, (df.get(t) || 0) + 1);
    }

    const idf = new Map();
    for (const [t, f] of df) idf.set(t, Math.log(1 + (n - f + 0.5) / (f + 0.5)));

    const avgdl = docs.reduce((sum, d) => sum + d.length, 0) / (n || 1);

    indexCache = { docs, idf, avgdl };
    return indexCache;
}

function bm25(queryTokens, doc, idf, avgdl) {
    let score = 0;
    for (const qt of new Set(queryTokens)) {
        const f = doc.tf.get(qt);
        if (!f) continue;
        const weight = idf.get(qt) || 0;
        score += weight * (f * (K1 + 1)) / (f + K1 * (1 - B + B * (doc.length / avgdl)));
    }
    return score;
}

export function buildRetrievalQuery(formData, metrics) {
    return [
        `Venture: ${formData.productName}.`,
        `Value proposition: ${formData.valueProposition}.`,
        `Industry: ${formData.industry}.`,
        `Customer type: ${formData.customerType}.`,
        `Geography: ${formData.geography}.`,
        `Pricing: ${formData.price} (${formData.pricingModel}).`,
        metrics ? `Estimated TAM ${metrics.tam}, SAM ${metrics.sam}, SOM ${metrics.som}.` : ''
    ].filter(Boolean).join(' ');
}

export async function retrieveContext(query, { industryKey = null, topK = 5 } = {}) {
    const { docs, idf, avgdl } = getIndex();
    const queryTokens = tokenize(query);

    const scored = docs.map((doc) => {
        let score = bm25(queryTokens, doc, idf, avgdl);
        if (industryKey && doc.industryKey === industryKey) score += INDUSTRY_BOOST;
        return { doc, score };
    });

    const maxScore = Math.max(...scored.map((s) => s.score), 1e-9);

    const results = scored
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map(({ doc, score }) => ({
            source: doc.source,
            type: doc.type,
            text: doc.text,
            similarity: Number((score / maxScore).toFixed(4))
        }));

    return { results, grounded: results.length > 0 };
}
