import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Device ID for Private Workspace (Privacy)
    deviceId: {
        type: String,
        required: true,
        index: true // Index for faster queries
    },
    // Store the Wizard Inputs
    inputs: {
        industry: String,
        customerType: String,
        geography: String,
        pricingModel: String,
        price: Number,
        valueProposition: String
    },
    // Store the Calculated Metrics (Hard Numbers)
    metrics: {
        tam: Number,
        sam: Number,
        som: Number
    },
    // Store the Fine-Tuned Assumptions (Sliders)
    assumptions: {
        avgPrice: Number,
        totalAddressableUsers: Number,
        marketReach: Number,
        marketShare: Number
    },
    // Store the AI Qualitative Analysis
    aiAnalysis: {
        executiveSummary: String,
        marketDrivers: [String],
        risks: [String],
        sanityCheck: String, // 'Conservative', 'Realistic', 'Optimistic'
        sanityCheckReason: String,
        isMock: Boolean
    },
    // Store the Calculation Logic Steps
    logicSteps: [String]
});

const Analysis = mongoose.model('Analysis', analysisSchema);

export default Analysis;
