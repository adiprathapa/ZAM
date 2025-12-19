import { useState, useEffect } from 'react';
import './App.css';
import WizardLayout from './components/wizard/WizardLayout';
import Dashboard from './components/Dashboard';
import { calculateTopDown, formatCurrency } from './services/calculationEngine';
import { fetchIndustries } from './services/referenceData';
import { generateMarketNarrative } from './services/aiService';
import { saveAnalysis } from './services/analysisService';
import { toPng } from 'html-to-image';
import PitchDeckChart from './components/PitchDeckChart';

function App() {
  const [view, setView] = useState('dashboard'); // 'dashboard', 'wizard', 'results'
  const [finalData, setFinalData] = useState(null);

  // AI State
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false); // This state is no longer used as `isAnalyzing` covers it
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Assumption State for Real-time Fine-tuning
  const [assumptions, setAssumptions] = useState({
    avgPrice: 0,
    totalAddressableUsers: 10000,
    marketReach: 25, // % for SAM
    marketShare: 5   // % for SOM
  });

  // Store original assumptions for reset functionality
  const [originalAssumptions, setOriginalAssumptions] = useState(null);

  const [metrics, setMetrics] = useState({ tam: 0, sam: 0, som: 0 });
  const [logicSteps, setLogicSteps] = useState([]);

  // Load a saved analysis into the view
  const handleViewAnalysis = (analysis) => {
    setFinalData(analysis.inputs);
    setAssumptions(analysis.assumptions);
    setMetrics(analysis.metrics);
    setAiAnalysis(analysis.aiAnalysis);
    // If logic steps aren't saved (currently they aren't in schema), just regenerate basic ones
    setLogicSteps(["Loaded from saved report."]);
    setView('results');
  };

  const handleStartWizard = () => {
    setFinalData(null);
    setAiAnalysis(null);
    setView('wizard');
  };

  // Initialize calculations when wizard completes
  const handleWizardComplete = async (data) => {
    console.log('Wizard Completed', data);
    setFinalData(data);

    // START ANALYSIS
    setIsAnalyzing(true);
    setAiError(null);
    setAiAnalysis(null);

    let errorView = false;
    try {
      // 1. Fetch Industry Benchmarks for this calculation
      let industryData = null;
      if (data.industry) {
        const allIndustries = await fetchIndustries();
        industryData = allIndustries.find(ind => ind.value === data.industry);
      }

      // 2. Run Calculation Engine (Local, Instant)
      const result = calculateTopDown(data, industryData || {});

      // 3. Trigger AI Analyst (Async)
      // We wait for this NOW so the UI doesn't transition until ready
      const aiResult = await generateMarketNarrative(data, result.metrics, result.logic);

      // If the AI service returned a demo/mock with a user-facing message
      // (e.g., API quota/limit reached), show the message in a dedicated
      // error view so the user does not land on the demo results screen.
      if (aiResult?.isMock && aiResult?.userMessage) {
        setAiError(aiResult.userMessage);
        setAiAnalysis(null);
        setFinalData(null);
        // Reset to local fallback assumptions so the dashboard isn't left in a weird state
        const fallbackResult = calculateTopDown(data, {});
        setAssumptions(fallbackResult.assumptions);
        setLogicSteps(fallbackResult.logic);
        errorView = true;
      } else {
        setAiAnalysis(aiResult);

        // 4. Update Estimates (AI Preferred, fallback to Local)
        if (aiResult.suggestedAssumptions) {
          console.log("AI Refined Assumptions:", aiResult.suggestedAssumptions);
          const newAssumptions = {
            avgPrice: aiResult.suggestedAssumptions.avgPrice || result.assumptions.avgPrice,
            totalAddressableUsers: aiResult.suggestedAssumptions.totalAddressableUsers || result.assumptions.totalAddressableUsers,
            marketReach: aiResult.suggestedAssumptions.marketReach || result.assumptions.marketReach,
            marketShare: aiResult.suggestedAssumptions.marketShare || result.assumptions.marketShare
          };
          setAssumptions(newAssumptions);
          setOriginalAssumptions(newAssumptions); // Store original for reset

          setLogicSteps([
            "AI Refined: Adjusting based on deep market analysis...",
            ...result.logic
          ]);
        } else {
          // Fallback to local if AI returns no numbers (unlikely with our prompt)
          setAssumptions(result.assumptions);
          setLogicSteps(result.logic);
        }
      }
    } catch (err) {
      console.error("Analysis Failed:", err);
      setAiError(err.message || "Unknown error occurred");
      // Still show results even if AI failed, just use local numbers
      const fallbackResult = calculateTopDown(data, {});
      setAssumptions(fallbackResult.assumptions);
      setLogicSteps(fallbackResult.logic);
    } finally {
      setIsAnalyzing(false);
      // If we flagged an error view due to API limits, show the dedicated error screen
      if (errorView) {
        setView('ai-error');
      } else {
        setView('results'); // REVEAL RESULTS ONLY NOW
      }
    }
  };

  const handleExportImage = () => {
    const node = document.getElementById('pitch-deck-export');
    if (!node) return;

    toPng(node, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `ZAM-Market-Analysis-${finalData?.productName || 'Analysis'}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('oops, something went wrong!', err);
      });
  };

  const handleSavePortfolio = async () => {
    if (!finalData) return;
    setIsSaving(true);
    try {
      // Validate Product Name (Backend Require this)
      const nameToSave = finalData.productName?.trim() || "Untitled Project";

      const payload = {
        productName: nameToSave,
        inputs: { ...finalData, productName: nameToSave }, // Ensure it matches in inputs too
        metrics: metrics,
        assumptions: assumptions,
        aiAnalysis: aiAnalysis || {} // Pass empty object if null to avoid complete omission if needed, though null is usually fine. Mongoose prefers objects for embedded schemas.
      };

      console.log("Saving Payload:", payload); // Debug log

      await saveAnalysis(payload);

      // Optional: Show success feedback? 
      // For now just go to dashboard
      setView('dashboard');
    } catch (err) {
      console.error("Save Error Details:", err);
      alert(`Failed to save: ${err.message}. See console for details.`);
    } finally {
      setIsSaving(false);
    }
  };

  // Recalculate metrics when assumptions change
  useEffect(() => {
    if (view !== 'results') return;

    const tam = assumptions.avgPrice * assumptions.totalAddressableUsers;
    const sam = tam * (assumptions.marketReach / 100);
    const som = sam * (assumptions.marketShare / 100);

    setMetrics({ tam, sam, som });
  }, [assumptions, view]);

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setAssumptions(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 onClick={() => setView('dashboard')} style={{ cursor: 'pointer' }}>ZAM</h1>
        <p>Data-Driven Market Sizing Copilot</p>
      </header>

      <main className="app-main">
        {isAnalyzing ? (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <div className="loading-text">Analyzing market data...</div>
            <div style={{ marginTop: '10px', color: '#94a3b8' }}>Consulting Gemini Flash</div>
          </div>
        ) : (
          <>
            {view === 'dashboard' && (
              <Dashboard
                onNewAnalysis={handleStartWizard}
                onViewAnalysis={handleViewAnalysis}
              />
            )}

            {view === 'wizard' && (
              <WizardLayout onComplete={handleWizardComplete} />
            )}

            {view === 'ai-error' && (
              <div className="api-error-screen" style={{ padding: '4rem', textAlign: 'center' }}>
                <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>Google API Limit Reached</h2>
                <p style={{ color: '#334155', marginBottom: '1.5rem' }}>{aiError || 'Google API limit has been reached. Please try again tomorrow.'}</p>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button className="btn-primary" onClick={() => {
                    setAiError(null);
                    setAiAnalysis(null);
                    setFinalData(null);
                    setView('dashboard');
                  }}>Back to Start</button>
                </div>
              </div>
            )}

            {view === 'results' && (
                <div className="results-container animate-fade-in">
                <div className="results-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                  <button className="btn-secondary" onClick={() => setView('dashboard')} style={{ marginRight: '1rem' }}>
                    Back to Dashboard
                  </button>
                  <button className="btn-primary" onClick={handleSavePortfolio} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save to Portfolio'}
                  </button>
                </div>

                {/* 1. The Numbers (Hard Data) */}
                <div className="metric-cards">
                  <div className="metric-card tam">
                    <h3>TAM</h3>
                    <p className="metric-value">{formatCurrency(metrics.tam)}</p>
                    <span className="metric-label">Total Addressable Market</span>
                  </div>
                  <div className="metric-card sam">
                    <h3>SAM</h3>
                    <p className="metric-value">{formatCurrency(metrics.sam)}</p>
                    <span className="metric-label">Serviceable Available Market</span>
                  </div>
                  <div className="metric-card som">
                    <h3>SOM</h3>
                    <p className="metric-value">{formatCurrency(metrics.som)}</p>
                    <span className="metric-label">Serviceable Obtainable Market</span>
                  </div>
                </div>

                {/* 2. AI Analyst Report (Qualitative) */}
                <div className="ai-report-section">
                  <div className="section-header">
                    <h2>AI Market Analyst</h2>
                    {aiAnalysis?.isMock ? (
                      <span className="badge" style={{ background: '#f59e0b', color: '#fff' }}>Demo Mode (API Error)</span>
                    ) : (
                      <span className="badge" style={{ background: '#10b981', color: '#fff' }}>Live Analysis</span>
                    )}
                  </div>

                  {aiAnalysis ? (
                    <div className="ai-content animate-fade-in">
                      <div className="report-card primary">
                        <h3>Executive Summary</h3>
                        <p>{aiAnalysis.executiveSummary}</p>
                        <div className={`badge ${aiAnalysis.sanityCheck?.toLowerCase()}`}>
                          Verdict: {aiAnalysis.sanityCheck}
                        </div>
                      </div>

                      <div className="report-grid">
                        <div className="report-card">
                          <ul className="zam-list">
                            {aiAnalysis.marketDrivers?.map((d, i) => <li key={i}>{d}</li>)}
                          </ul>
                        </div>
                        <div className="report-card">
                          <ul className="zam-list">
                            {aiAnalysis.risks?.map((r, i) => <li key={i}>{r}</li>)}
                          </ul>
                        </div>
                      </div>

                      {/* 3. Pitch Deck Visual Export */}
                      <div className="report-card primary export-section">
                        <div className="export-header">
                          <h3>Pitch Deck Visual</h3>
                          <button className="btn-secondary" onClick={handleExportImage}>
                            Download Image
                          </button>
                        </div>
                        <p className="section-note">High-resolution target chart for your investor presentations.</p>

                        <div className="export-preview">
                          <PitchDeckChart
                            metrics={metrics}
                            productName={finalData?.productName}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="error-box">
                      <p className="error-text">Analysis unavailable.</p>
                      {aiError && (
                        <div style={{ color: '#ef4444', marginTop: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                          <strong>Error Details:</strong> {aiError}
                          <br />
                          <small>Possible Fix: Check .env file for VITE_GEMINI_API_KEY</small>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Logic & Fine Tuning */}
                <section className="fine-tune-section">
                  <div className="report-card primary">
                    <h3>Calculation Logic</h3>
                    <ul className="zam-list">
                      {logicSteps.map((step, i) => <li key={i}>{step}</li>)}
                    </ul>
                  </div>

                  <div className="report-card">
                    <h3>Fine Tune Assumptions</h3>
                    <p className="section-note">Adjust these parameters to see real-time impact on market sizing.</p>

                    <div className="slider-group">
                      <div className="slider-header">
                        <label>Average Price / ACV ({formatCurrency(assumptions.avgPrice)})</label>
                        <input
                          type="number"
                          name="avgPrice"
                          min="1"
                          value={assumptions.avgPrice}
                          onChange={handleSliderChange}
                          className="form-input"
                          style={{ width: '150px', textAlign: 'right' }}
                        />
                      </div>
                    </div>

                    <div className="slider-group">
                      <div className="slider-header">
                        <label>Total Market Users</label>
                        <input
                          type="number"
                          name="totalAddressableUsers"
                          min="1000"
                          value={assumptions.totalAddressableUsers}
                          onChange={handleSliderChange}
                          className="form-input"
                          style={{ width: '150px', textAlign: 'right' }}
                        />
                      </div>
                    </div>

                    <div className="slider-group">
                      <div className="slider-header">
                        <label>Market Reach (SAM %)</label>
                        <input
                          type="number"
                          name="marketReach"
                          min="1"
                          max="100"
                          value={assumptions.marketReach}
                          onChange={handleSliderChange}
                          className="form-input"
                          style={{ width: '150px', textAlign: 'right' }}
                        />
                      </div>
                      <input
                        type="range"
                        name="marketReach"
                        min="1"
                        max="100"
                        step="1"
                        value={assumptions.marketReach}
                        onChange={handleSliderChange}
                      />
                    </div>

                    <div className="slider-group">
                      <div className="slider-header">
                        <label>Market Share (SOM %)</label>
                        <input
                          type="number"
                          name="marketShare"
                          min="0.1"
                          max="100"
                          step="0.1"
                          value={assumptions.marketShare}
                          onChange={handleSliderChange}
                          className="form-input"
                          style={{ width: '150px', textAlign: 'right' }}
                        />
                      </div>
                      <input
                        type="range"
                        name="marketShare"
                        min="0.1"
                        max="50"
                        step="0.1"
                        value={assumptions.marketShare}
                        onChange={handleSliderChange}
                      />
                    </div>
                  </div>
                </section>
              </div>
            )}
          </>
        )
      </main>
    </div>
  );
}

export default App;
