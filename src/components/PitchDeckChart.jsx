import React from 'react';
import { formatCurrency } from '../services/calculationEngine';
import './PitchDeckChart.css';

const PitchDeckChart = ({ metrics, productName }) => {
    return (
        <div id="pitch-deck-export" className="pitch-deck-container">
            <div className="target-visual hexagonal-layout">
                {/* TAM - Back/Right */}
                <div className="hexagon tam-hex">
                    <div className="hex-content">
                        <div className="hex-label">TAM</div>
                        <div className="hex-title">Total Addressable Market</div>
                        <div className="hex-value">{formatCurrency(metrics.tam)}</div>
                    </div>
                </div>

                {/* SAM - Middle */}
                <div className="hexagon sam-hex">
                    <div className="hex-content">
                        <div className="hex-label">SAM</div>
                        <div className="hex-title">Serviceable Addressable Market</div>
                        <div className="hex-value">{formatCurrency(metrics.sam)}</div>
                    </div>
                </div>

                {/* SOM - Front/Left */}
                <div className="hexagon som-hex">
                    <div className="hex-content">
                        <div className="hex-label">SOM</div>
                        <div className="hex-title">Serviceable Obtainable Market</div>
                        <div className="hex-value">{formatCurrency(metrics.som)}</div>
                    </div>
                </div>
            </div>
            <div className="chart-branding">ZAM Market Analysis</div>
        </div>
    );
};

export default PitchDeckChart;
