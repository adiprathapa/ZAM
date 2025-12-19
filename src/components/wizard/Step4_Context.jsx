import { useState, useEffect } from 'react';
import { fetchConstants } from '../../services/referenceData';

const Step4_Context = ({ data, updateData }) => {
    const [marketMaturity, setMarketMaturity] = useState([]);

    useEffect(() => {
        fetchConstants().then(constants => {
            if (constants.MARKET_MATURITY) setMarketMaturity(constants.MARKET_MATURITY);
        });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        updateData({ [name]: value });
    };

    return (
        <div className="wizard-step animate-fade-in">
            <h2>Step 4: Market Context</h2>
            <p className="step-description">Understanding the competitive landscape.</p>

            <div className="form-group">
                <label htmlFor="marketMaturity">Market Maturity</label>
                <select
                    id="marketMaturity"
                    name="marketMaturity"
                    value={data.marketMaturity}
                    onChange={handleChange}
                    className="form-select"
                >
                    {marketMaturity.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="competitors">Key Competitors</label>
                <textarea
                    id="competitors"
                    name="competitors"
                    value={data.competitors}
                    onChange={handleChange}
                    placeholder="List 3-5 main competitors..."
                    className="form-textarea"
                    rows={3}
                />
            </div>

            <div className="form-group">
                <label htmlFor="barriers">Regulatory Barriers / Switching Costs</label>
                <textarea
                    id="barriers"
                    name="barriers"
                    value={data.barriers}
                    onChange={handleChange}
                    placeholder="Is it hard to enter? Is it hard for customers to switch?"
                    className="form-textarea"
                    rows={2}
                />
            </div>
        </div>
    );
};

export default Step4_Context;
