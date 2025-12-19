const Step3_GTM = ({ data, updateData }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        // Handle number inputs
        if (['churnRate', 'expansionRate'].includes(name)) {
            updateData({ [name]: value === '' ? '' : parseFloat(value) });
        } else {
            updateData({ [name]: value });
        }
    };

    return (
        <div className="wizard-step animate-fade-in">
            <h2>Step 3: Go to Market</h2>
            <p className="step-description">How will you acquire and retain customers?</p>

            <div className="form-group">
                <label htmlFor="salesCycle">Sales Cycle Length</label>
                <select
                    id="salesCycle"
                    name="salesCycle"
                    value={data.salesCycle}
                    onChange={handleChange}
                    className="form-select"
                >
                    <option value="1_month">&lt; 1 Month (Self-Serve)</option>
                    <option value="3_months">1-3 Months (Transactional)</option>
                    <option value="6_months">3-6 Months (Mid-Market)</option>
                    <option value="12_months">6-12+ Months (Enterprise)</option>
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="acquisitionChannels">Primary Acquisition Channels</label>
                <textarea
                    id="acquisitionChannels"
                    name="acquisitionChannels"
                    value={data.acquisitionChannels}
                    onChange={handleChange}
                    placeholder="How are you acquiring customers?"
                    className="form-textarea"
                    rows={2}
                />
                <small className="field-hint">List your top 2-3 channels.</small>
            </div>

            <div className="form-row">
                <div className="form-group half">
                    <label htmlFor="churnRate">
                        Expected Annual Churn (%)
                    </label>
                    <input
                        type="number"
                        id="churnRate"
                        name="churnRate"
                        value={data.churnRate}
                        onChange={handleChange}
                        placeholder="Churn Rate"
                        min="0"
                        max="100"
                        className="form-input"
                    />
                </div>

                <div className="form-group half">
                    <label htmlFor="expansionRate">
                        Expansion Revenue (%)
                    </label>
                    <input
                        type="number"
                        id="expansionRate"
                        name="expansionRate"
                        value={data.expansionRate}
                        onChange={handleChange}
                        placeholder="Expansion Rate"
                        min="0"
                        className="form-input"
                    />
                </div>
            </div>
        </div>
    );
};

export default Step3_GTM;
