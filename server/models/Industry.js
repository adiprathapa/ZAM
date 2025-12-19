import mongoose from 'mongoose';

const IndustrySchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true }, // e.g., 'saas_horizontal'
    name: { type: String, required: true },
    description: String,
    metrics: {
        avgAcv: Number,
        churnRate: Number,
        growthRate: Number
    },
    naicsCodes: [String],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Industry', IndustrySchema);
