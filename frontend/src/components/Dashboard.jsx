import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, Star, Clock, Trophy, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
    const [history, setHistory] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [activeTab, setActiveTab] = useState('history'); // history, leaderboard
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // Fetch User Test History
                axios.get('http://localhost:5000/api/test/history', config)
                    .then(res => setHistory(res.data))
                    .catch(err => {
                        if (err.response?.status === 401) handleLogout();
                        console.error(err);
                    })
                    .finally(() => setLoadingHistory(false));

                // Fetch Global Leaderboard
                axios.get('http://localhost:5000/api/test/leaderboard', config)
                    .then(res => setLeaderboard(res.data))
                    .catch(err => console.error(err))
                    .finally(() => setLoadingLeaderboard(false));

                // Fetch Correct Answer Key for reference
                axios.get('http://localhost:5000/api/test/answers', config)
                    .then(res => setAnswers(res.data))
                    .catch(err => console.error(err));

            } catch (err) {
                console.error('Failed to initialize dashboard', err);
            }
        };

        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const startTest = () => {
        navigate('/test');
    };

    return (
        <>
            <nav className="navbar">
                <div className="nav-brand">
                    <BookOpen />
                    <span>IELTS Mastery</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: 500 }}>Hello, {user.username}</span>
                    <button className="btn-logout" onClick={handleLogout}>
                        <LogOut size={16} style={{ marginRight: '0.25rem' }} />
                        Logout
                    </button>
                </div>
            </nav>

            <div className="dashboard-container">
                <div className="welcome-banner">
                    <h1 className="welcome-title">Ready to test your English?</h1>
                    <p className="welcome-subtitle">
                        Take our 30-question mock test to estimate your IELTS Band Score standard.
                    </p>
                    <button className="btn-start" onClick={startTest}>
                        Start New Test
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid var(--border-color)', marginBottom: '2rem' }}>
                    <button
                        onClick={() => setActiveTab('history')}
                        style={{
                            padding: '1rem 2rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'history' ? '3px solid var(--primary-color)' : '3px solid transparent',
                            color: activeTab === 'history' ? 'var(--primary-color)' : 'var(--text-secondary)',
                            fontWeight: 600,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Clock size={20} /> My Progress
                    </button>
                    <button
                        onClick={() => setActiveTab('leaderboard')}
                        style={{
                            padding: '1rem 2rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'leaderboard' ? '3px solid var(--primary-color)' : '3px solid transparent',
                            color: activeTab === 'leaderboard' ? 'var(--primary-color)' : 'var(--text-secondary)',
                            fontWeight: 600,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Trophy size={20} /> Global Ranking
                    </button>
                </div>

                {activeTab === 'history' && (
                    <>
                        {loadingHistory ? (
                            <p>Loading history...</p>
                        ) : history.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                <Star size={48} color="var(--text-secondary)" style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>You haven't taken any tests yet.</p>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Your results will appear here.</p>
                            </div>
                        ) : (
                            <div className="card-grid">
                                {history.map((record) => (
                                    <div key={record.id} className="history-card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                {new Date(record.test_date).toLocaleDateString()} at {new Date(record.test_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <div style={{ background: 'var(--primary-color)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.875rem' }}>
                                                Band {record.band_score.toFixed(1)}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                            {record.score} / 30
                                        </div>
                                        <div style={{ color: 'var(--success-color)', fontSize: '0.875rem', fontWeight: 500 }}>
                                            Test Completed Successfully
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'leaderboard' && (
                    <div style={{ background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                        {loadingLeaderboard ? (
                            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Leaderboard...</div>
                        ) : leaderboard.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No test records available globally.</div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Rank</th>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>User</th>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Highest Band</th>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Raw Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.map((userStats, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                {index === 0 && <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>🥇 1</span>}
                                                {index === 1 && <span style={{ color: '#9ca3af', fontWeight: 'bold' }}>🥈 2</span>}
                                                {index === 2 && <span style={{ color: '#b45309', fontWeight: 'bold' }}>🥉 3</span>}
                                                {index > 2 && <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>{index + 1}</span>}
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', fontWeight: 500, color: userStats.username === user.username ? 'var(--primary-color)' : 'var(--text-primary)' }}>
                                                {userStats.username} {userStats.username === user.username && '(You)'}
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', fontWeight: 'bold' }}>{userStats.highest_band.toFixed(1)}</td>
                                            <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)' }}>{userStats.highest_score}/30</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

            </div>
        </>
    );
};

export default Dashboard;
