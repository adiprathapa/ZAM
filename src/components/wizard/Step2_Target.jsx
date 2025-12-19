import { useState, useEffect } from 'react';
import { fetchIndustries, fetchConstants } from '../../services/referenceData';

const Step2_Target = ({ data, updateData }) => {
    const [industries, setIndustries] = useState([]);
    const [customerTypes, setCustomerTypes] = useState([]);
    const [geographies, setGeographies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const [apiIndustries, constants] = await Promise.all([
                fetchIndustries(),
                fetchConstants()
            ]);
            setIndustries(apiIndustries);
            if (constants.CUSTOMER_TYPES) setCustomerTypes(constants.CUSTOMER_TYPES);
            if (constants.GEOGRAPHIES) setGeographies(constants.GEOGRAPHIES);
            setLoading(false);
        };
        loadData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'employees') {
            updateData({ [name]: value === '' ? '' : parseInt(value, 10) });
        } else {
            updateData({ [name]: value });
        }
    };

    return (
        <div className="wizard-step animate-fade-in">
            <h2>Step 2: Target Customer</h2>
            <p className="step-description">Who is this for? We'll use this to find real market data.</p>

            <div className="form-row">
                <div className="form-group half">
                    <label htmlFor="customerType">Customer Type</label>
                    <select
                        id="customerType"
                        name="customerType"
                        value={data.customerType}
                        onChange={handleChange}
                        className="form-select"
                    >
                        {customerTypes.length === 0 && <option>Loading...</option>}
                        {customerTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group half">
                    <label htmlFor="industry">Industry / Vertical</label>
                    {loading ? (
                        <p className="loading-text">Loading descriptors...</p>
                    ) : (
                        <select
                            id="industry"
                            name="industry"
                            value={data.industry}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="">Select an industry...</option>
                            {industries.map(ind => (
                                <option key={ind.value} value={ind.value}>{ind.label}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            <div className="form-row">
                <div className="form-group half">
                    <label htmlFor="employees">Employees</label>
                    <input
                        type="number"
                        id="employees"
                        name="employees"
                        value={data.employees}
                        onChange={handleChange}
                        placeholder="Company Size"
                        min="1"
                        className="form-input"
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="geography">Primary Geography</label>
                <select
                    id="geography"
                    name="geography"
                    value={data.geography}
                    onChange={handleChange}
                    className="form-select"
                >
                    {geographies.map(geo => (
                        <option key={geo.value} value={geo.value}>{geo.label}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="buyerPersona">Buyer Persona (Role/Title)</label>
                <input
                    type="text"
                    id="buyerPersona"
                    name="buyerPersona"
                    value={data.buyerPersona}
                    onChange={handleChange}
                    placeholder="Who writes the check?"
                    className="form-input"
                />
            </div>
        </div>
    );
};

export default Step2_Target;
