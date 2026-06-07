import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { indexKnowledgeBase } from './build.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zam';

async function run() {
    if (!process.env.GEMINI_API_KEY) {
        console.error('Missing GEMINI_API_KEY. Set it in .env before indexing.');
        process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for RAG indexing');
    console.log('Embedding knowledge chunks with gemini-embedding-001...');

    const count = await indexKnowledgeBase({
        delayMs: 150,
        onProgress: (i, total, chunk) => console.log(`  [${i}/${total}] ${chunk.source}`)
    });

    console.log(`RAG index built: ${count} chunks stored in KnowledgeChunk.`);
    await mongoose.disconnect();
    process.exit(0);
}

run().catch((err) => {
    console.error('RAG indexing failed:', err.message);
    process.exit(1);
});
