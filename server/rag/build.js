import KnowledgeChunk from '../models/KnowledgeChunk.js';
import { buildCorpus } from './corpus.js';
import { embedDocument } from './embeddings.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function indexKnowledgeBase({ delayMs = 0, onProgress = null } = {}) {
    const corpus = buildCorpus();
    await KnowledgeChunk.deleteMany({});

    let indexed = 0;
    for (const chunk of corpus) {
        const embedding = await embedDocument(chunk.text);
        await KnowledgeChunk.create({ ...chunk, embedding });
        indexed += 1;
        if (onProgress) onProgress(indexed, corpus.length, chunk);
        if (delayMs) await delay(delayMs);
    }

    return indexed;
}
