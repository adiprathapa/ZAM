import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({
    name: { type: String, required: true },
    ticker: String,
    industry: { type: String, required: true, index: true }, // Links to Industry key
    description: String,
    metrics: {
        revenue: Number,
        growth: Number,
        customers: Number,
        acv: Number
    },
    model: String, // 'subscription', 'usage', etc.
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Company', CompanySchema);
