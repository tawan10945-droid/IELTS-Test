import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User } from 'lucide-react';
import axios from 'axios';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                username,
                password
            });

            // Auto redirect to login after success
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to register. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
                    <UserPlus size={48} strokeWidth={1.5} />
                </div>
                <h1 className="auth-title">Create Account</h1>
                <p className="auth-subtitle">Join IELTS Mastery and track your progress</p>

                {error && (
                    <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister}>
                    <div className="input-group">
                        <label className="input-label" htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            className="input-field"
                            placeholder="Choose a username"
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
                            placeholder="Create a strong password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="input-field"
                            placeholder="Repeat your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={isLoading}>
                        {isLoading ? 'Creating account...' : (
                            <>
                                <UserPlus size={20} />
                                Sign Up
                            </>
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
