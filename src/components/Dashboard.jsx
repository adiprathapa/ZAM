import { useState, useEffect } from 'react';
import { fetchAnalyses, deleteAnalysis } from '../services/analysisService';
import { formatCurrency } from '../services/calculationEngine';
import './Dashboard.css';

const Dashboard = ({ onNewAnalysis, onViewAnalysis }) => {
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, name }

    useEffect(() => {
        loadAnalyses();
    }, []);

    const loadAnalyses = async () => {
        try {
            setLoading(true);
            const data = await fetchAnalyses();
            setAnalyses(data);
        } catch (err) {
            setError("Failed to load reports.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (e, id, name) => {
        e.stopPropagation(); // Prevent opening the review
        setDeleteConfirm({ id, name }); // Show custom modal
    };

    const confirmDelete = async () => {
        try {
            await deleteAnalysis(deleteConfirm.id);
            setAnalyses(prev => prev.filter(a => a._id !== deleteConfirm.id));
            setDeleteConfirm(null);
        } catch (err) {
            alert("Failed to delete. Try again.");
        }
    };

    if (loading) return <div className="dashboard-loading">Loading Portfolio...</div>;

    return (
        <div className="dashboard-container animate-fade-in">
            <header className="dashboard-header">
                <h2>My Venture Portfolio</h2>
                <button className="btn-primary" onClick={onNewAnalysis}>
                    + New Analysis
                </button>
            </header>

            {error && <div className="error-banner">{error}</div>}

            {analyses.length === 0 && !loading ? (
                <div className="empty-state-hero">
                    <div className="hero-content">
                        <div className="hero-icon">📈</div>
                        <h3>Your Venture Portfolio is Empty</h3>
                        <p>ZAM helps you map markets, size opportunities, and simulate growth with VC-grade precision.</p>
                        <button className="btn-primary btn-large" onClick={onNewAnalysis}>
                            Create Your First Analysis
                        </button>
                    </div>

                    <div className="feature-previews">
                        <div className="feature-preview-card">
                            <span className="feature-icon">🔍</span>
                            <h4>Market Mapping</h4>
                            <p>Target specific industries and buyer personas with built-in reference data.</p>
                        </div>
                        <div className="feature-preview-card">
                            <span className="feature-icon">⛓️</span>
                            <h4>Top-Down Precision</h4>
                            <p>Convert vague TAM estimates into concrete, actionable business targets.</p>
                        </div>
                        <div className="feature-preview-card">
                            <span className="feature-icon">🤖</span>
                            <h4>AI Analyst</h4>
                            <p>Get instant qualitative reviews and risk assessments via Gemini 2.0.</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="analysis-grid">
                    {Array.isArray(analyses) ? analyses.map((item) => (
                        <div key={item._id} className="analysis-card" onClick={() => onViewAnalysis(item)}>
                            <div className="card-header">
                                <h3>{item.productName}</h3>
                                <div className="card-actions">
                                    <span className="date-badge">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </span>
                                    <button
                                        className="btn-icon-delete"
                                        onClick={(e) => handleDelete(e, item._id, item.productName)}
                                        title="Delete Analysis"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <div className="card-metrics">
                                <div className="mini-metric">
                                    <label>TAM</label>
                                    <span>{formatCurrency(item.metrics?.tam || 0)}</span>
                                </div>
                                <div className="mini-metric">
                                    <label>Verdict</label>
                                    <span className={`verdict-badge ${item.aiAnalysis?.sanityCheck?.toLowerCase()}`}>
                                        {item.aiAnalysis?.sanityCheck || 'N/A'}
                                    </span>
                                </div>
                            </div>

                            <div className="card-summary">
                                <p>{item.aiAnalysis?.executiveSummary.substring(0, 100)}...</p>
                            </div>
                        </div>
                    )) : (
                        <div className="error-banner">Error loading portfolio data</div>
                    )}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Delete Analysis?</h3>
                        <p>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?</p>
                        <p className="modal-warning">This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>
                                Cancel
                            </button>
                            <button className="btn-danger" onClick={confirmDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
