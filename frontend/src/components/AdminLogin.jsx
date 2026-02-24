import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import axios from 'axios';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                username,
                password
            });

            localStorage.setItem('adminToken', response.data.token);
            localStorage.setItem('adminUser', JSON.stringify(response.data.user));
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to login as Admin.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-wrapper" style={{ background: '#f8fafc' }}>
            <div className="auth-card" style={{ borderTop: '4px solid #ef4444' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#ef4444' }}>
                    <ShieldCheck size={48} strokeWidth={1.5} />
                </div>
                <h1 className="auth-title">Admin Access</h1>
                <p className="auth-subtitle">Restricted area for system administrators</p>

                {error && (
                    <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label className="input-label" htmlFor="username">Admin Username</label>
                        <input
                            type="text"
                            id="username"
                            className="input-field"
                            placeholder="Enter admin username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="input-field"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ background: '#ef4444', color: 'white' }} disabled={isLoading}>
                        {isLoading ? 'Verifying...' : 'Access Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
