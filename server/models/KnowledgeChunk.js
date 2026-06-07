import mongoose from 'mongoose';

const KnowledgeChunkSchema = new mongoose.Schema({
    docId: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    source: { type: String, required: true },
    industryKey: { type: String, index: true },
    text: { type: String, required: true },
    embedding: { type: [Number], required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('KnowledgeChunk', KnowledgeChunkSchema);
