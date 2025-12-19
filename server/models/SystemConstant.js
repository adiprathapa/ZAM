import mongoose from 'mongoose';

const SystemConstantSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true }, // e.g., 'PRICING_MODELS'
    items: [{
        value: String,
        label: String,
        factor: Number // Optional, for geographies
    }]
});

export default mongoose.model('SystemConstant', SystemConstantSchema);
