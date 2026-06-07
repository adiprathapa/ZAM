import KnowledgeChunk from '../models/KnowledgeChunk.js';
import { embedQuery, cosineSimilarity } from './embeddings.js';

const INDUSTRY_BOOST = 0.05;

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
    const chunks = await KnowledgeChunk.find().lean();
    if (!chunks.length) {
        return { results: [], grounded: false };
    }

    const queryVector = await embedQuery(query);

    const ranked = chunks
        .map((chunk) => {
            const similarity = cosineSimilarity(queryVector, chunk.embedding);
            const boost = industryKey && chunk.industryKey === industryKey ? INDUSTRY_BOOST : 0;
            return { chunk, similarity, score: similarity + boost };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map(({ chunk, similarity }) => ({
            source: chunk.source,
            type: chunk.type,
            text: chunk.text,
            similarity: Number(similarity.toFixed(4))
        }));

    return { results: ranked, grounded: true };
}
