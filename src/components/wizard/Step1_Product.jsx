import { useState, useEffect } from 'react';
import { fetchConstants } from '../../services/referenceData';

const Step1_Product = ({ data, updateData }) => {
    const [pricingModels, setPricingModels] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            const constants = await fetchConstants();
            if (constants.PRICING_MODELS) setPricingModels(constants.PRICING_MODELS);
        };
        loadData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Handle number inputs
        if (['price', 'acv', 'fees'].includes(name)) {
            updateData({ [name]: value === '' ? '' : parseFloat(value) });
        } else {
            updateData({ [name]: value });
        }
    };

    return (
        <div className="wizard-step animate-fade-in">
            <h2>Step 1: Product Basics</h2>
            <p className="step-description">Tell us about what you're building and how you make money.</p>

            <div className="form-group">
                <label htmlFor="productName">Product Name</label>
                <input
                    type="text"
                    id="productName"
                    name="productName"
                    value={data.productName}
                    onChange={handleChange}
                    placeholder="What is your product name?"
                    className="form-input"
                />
            </div>

            <div className="form-group">
                <label htmlFor="valueProposition">Value Proposition</label>
                <textarea
                    id="valueProposition"
                    name="valueProposition"
                    value={data.valueProposition}
                    onChange={handleChange}
                    placeholder="What problem does your product solve?"
                    className="form-textarea"
                    rows={3}
                />
            </div>

            <div className="form-row">
                <div className="form-group half">
                    <label htmlFor="pricingModel">Pricing Model</label>
                    <select
                        id="pricingModel"
                        name="pricingModel"
                        value={data.pricingModel}
                        onChange={handleChange}
                        className="form-select"
                    >
                        {pricingModels.length === 0 && <option>Loading...</option>}
                        {pricingModels.map(model => (
                            <option key={model.value} value={model.value}>{model.label}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group half">
                    <label htmlFor="price">
                        {data.pricingModel === 'one_time' ? 'Price per Unit ($)' : 'Price per Period ($)'}
                    </label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        value={data.price}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0"
                        className="form-input"
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group half">
                    <label htmlFor="acv">
                        Average Contract Value (Annual $)
                    </label>
                    <input
                        type="number"
                        id="acv"
                        name="acv"
                        value={data.acv}
                        onChange={handleChange}
                        placeholder="Estimate yearly value"
                        min="0"
                        className="form-input"
                    />
                </div>

                <div className="form-group half">
                    <label htmlFor="fees">One-time Implementation Fees ($)</label>
                    <input
                        type="number"
                        id="fees"
                        name="fees"
                        value={data.fees}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0"
                        className="form-input"
                    />
                </div>
            </div>
        </div>
    );
};

export default Step1_Product;
