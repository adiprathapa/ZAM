import React from 'react';
import { formatCurrency } from '../services/calculationEngine';
import './PitchDeckChart.css';

const PitchDeckChart = ({ metrics, productName }) => {
    return (
        <div id="pitch-deck-export" className="pitch-deck-container">
            <div className="target-visual">
                {/* TAM - Outer */}
                <div className="circle tam-circle">
                    <div className="circle-label tam-label">
                        <span className="label-name">TAM</span>
                        <span className="label-value">{formatCurrency(metrics.tam)}</span>
                    </div>

                    {/* SAM - Middle */}
                    <div className="circle sam-circle">
                        <div className="circle-label sam-label">
                            <span className="label-name">SAM</span>
                            <span className="label-value">{formatCurrency(metrics.sam)}</span>
                        </div>

                        {/* SOM - Inner */}
                        <div className="circle som-circle">
                            <div className="circle-label som-label">
                                <span className="label-name">SOM</span>
                                <span className="label-value">{formatCurrency(metrics.som)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="chart-branding">ZAM Market Analysis</div>
        </div>
    );
};

export default PitchDeckChart;
