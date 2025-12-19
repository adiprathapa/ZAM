import { useState } from 'react';
import Step1_Product from './Step1_Product';
import Step2_Target from './Step2_Target';
import Step3_GTM from './Step3_GTM';
import Step4_Context from './Step4_Context';

const WizardLayout = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Step 1
        productName: '',
        valueProposition: '',
        pricingModel: 'subscription',
        price: '',
        acv: '',
        fees: '',
        // Step 2
        customerType: 'b2b',
        industry: '',
        employees: '',
        geography: 'global',
        buyerPersona: '',
        // Step 3
        salesCycle: '3_months',
        acquisitionChannels: '',
        churnRate: '',
        expansionRate: '',
        // Step 4
        marketMaturity: 'growth',
        competitors: '',
        barriers: ''
    });

    const updateData = (newData) => {
        setFormData(prev => ({ ...prev, ...newData }));
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleComplete = () => {
        onComplete(formData);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1: return <Step1_Product data={formData} updateData={updateData} />;
            case 2: return <Step2_Target data={formData} updateData={updateData} />;
            case 3: return <Step3_GTM data={formData} updateData={updateData} />;
            case 4: return <Step4_Context data={formData} updateData={updateData} />;
            default: return null;
        }
    };

    const progressPercentage = (currentStep / 4) * 100;

    return (
        <div className="wizard-container">
            <div className="wizard-progress-bar">
                <div
                    className="progress-fill"
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>

            <div className="wizard-header">
                <span className="step-indicator">Step {currentStep} of 4</span>
            </div>

            <div className="wizard-content">
                {renderStep()}
            </div>

            <div className="wizard-actions">
                {currentStep > 1 && (
                    <button className="btn-secondary" onClick={prevStep}>
                        ← Back
                    </button>
                )}

                {currentStep < 4 ? (
                    <button className="btn-primary" onClick={nextStep}>
                        Next Step →
                    </button>
                ) : (
                    <button className="btn-primary btn-analyze" onClick={handleComplete}>
                        Analyze Market
                    </button>
                )}
            </div>
        </div>
    );
};

export default WizardLayout;
