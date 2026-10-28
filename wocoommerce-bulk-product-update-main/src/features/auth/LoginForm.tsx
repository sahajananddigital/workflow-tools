import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './Auth.css';
import { Loader2 } from 'lucide-react';

export const LoginForm: React.FC = () => {
    const { login } = useAuth();
    const [storeUrl, setStoreUrl] = useState('');
    const [consumerKey, setConsumerKey] = useState('');
    const [consumerSecret, setConsumerSecret] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const success = await login({ storeUrl, consumerKey, consumerSecret });
            if (!success) {
                setError('Connection failed. Please check your credentials and ensure the store URL is correct.');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-wrapper">
                {/* Left Side: Instructions */}
                <div className="auth-info">
                    <div style={{ marginBottom: '2rem' }}>
                        <img
                            src="https://sahajananddigital.in/images/logo.png"
                            alt="Sahajanand Digital"
                            style={{ height: '50px', objectFit: 'contain' }}
                        />
                    </div>
                    <h1>Welcome to Bulk Editor</h1>
                    <p className="auth-subtitle">Manage your WooCommerce store efficiently.</p>

                    <div className="auth-steps">
                        <h3><span className="step-num">1</span> How to connect:</h3>
                        <p>Go to your WordPress Admin → <b>WooCommerce</b> → <b>Settings</b>.</p>

                        <h3><span className="step-num">2</span> Generate Keys:</h3>
                        <p>Click on <b>Advanced</b> → <b>REST API</b> → <b>Add key</b>.</p>

                        <h3><span className="step-num">3</span> Permissions:</h3>
                        <p>Set permissions to <b>Read/Write</b> and click "Generate API key".</p>

                        <div className="info-box">
                            <small>
                                🔒 <b>Security Note:</b> Your keys are stored <strong>locally</strong> in your browser.
                                We never see or store your credentials on any server.
                            </small>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="auth-card">
                    <div className="auth-header">
                        <h2>Connect Store</h2>
                        <p>Enter your API credentials below</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Store URL</label>
                            <input
                                type="url"
                                className="form-input"
                                placeholder="https://your-store.com"
                                value={storeUrl}
                                onChange={(e) => setStoreUrl(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Consumer Key</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxx"
                                value={consumerKey}
                                onChange={(e) => setConsumerKey(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Consumer Secret</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxx"
                                value={consumerSecret}
                                onChange={(e) => setConsumerSecret(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Connect Store'}
                        </button>
                    </form>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                        <a
                            href="/wocoommerce-bulk-product-update/docs/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}
                        >
                            Need help? Read the Documentation
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
