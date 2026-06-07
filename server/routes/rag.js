import express from 'express';
import KnowledgeChunk from '../models/KnowledgeChunk.js';
import { indexKnowledgeBase } from '../rag/build.js';

const router = express.Router();

router.get('/status', async (req, res) => {
    try {
        const chunks = await KnowledgeChunk.estimatedDocumentCount();
        res.json({ indexed: chunks > 0, chunks });
    } catch (error) {
        res.status(500).json({ message: 'Status check failed', error: error.message });
    }
});

router.post('/index', async (req, res) => {
    const expected = process.env.RAG_INDEX_TOKEN;
    if (!expected) {
        return res.status(503).json({
            message: 'RAG indexing is disabled. Set RAG_INDEX_TOKEN in the environment to enable it.'
        });
    }

    const provided = req.get('x-rag-token') || req.body?.token;
    if (provided !== expected) {
        return res.status(401).json({ message: 'Invalid or missing RAG index token' });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ message: 'Missing GEMINI_API_KEY in environment' });
    }

    try {
        const chunks = await indexKnowledgeBase({ delayMs: 50 });
        res.json({ message: 'RAG index built', chunks });
    } catch (error) {
        console.error('RAG index route failed:', error);
        res.status(500).json({ message: 'RAG indexing failed', error: error.message });
    }
});

export default router;
