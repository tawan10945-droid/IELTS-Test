import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, LogOut, Trash2 } from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalTests: 0, averageBandScore: 0 });
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const token = localStorage.getItem('adminToken');

    useEffect(() => {
        if (!token) {
            navigate('/admin/login');
            return;
        }
        fetchData();
    }, [navigate, token]);

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const statsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/stats`, config);
            const usersRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, config);

            setStats(statsRes.data);
            setUsers(usersRes.data);
            setIsLoading(false);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                handleLogout();
            } else {
                setError('Failed to fetch admin data.');
            }
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? ALL of their test results will also be deleted. This action cannot be undone.')) {
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`, config);

            // Refresh data
            fetchData();
        } catch (err) {
            alert('Failed to delete user: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
    };

    if (isLoading) {
        return <div className="loading" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Admin Panel...</div>;
    }

    return (
        <div className="dashboard-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#1e293b' }}>Control Panel</h1>
                    <p style={{ color: '#64748b' }}>Manage your IELTS Testing Platform</p>
                </div>
                <button
                    onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', color: '#dc2626', fontWeight: 500 }}
                >
                    <LogOut size={18} />
                    Logout Admin
                </button>
            </div>

            {error && (
                <div style={{ background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
                    {error}
                </div>
            )}

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: '#eff6ff', color: '#3b82f6', borderRadius: '0.75rem' }}>
                            <Users size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b' }}>Total Users</h3>
                    </div>
                    <p style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a' }}>{stats.totalUsers}</p>
                </div>

                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: '#f0fdf4', color: '#22c55e', borderRadius: '0.75rem' }}>
                            <Activity size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b' }}>Total Tests Taken</h3>
                    </div>
                    <p style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a' }}>{stats.totalTests}</p>
                </div>

                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: '#fef3c7', color: '#f59e0b', borderRadius: '0.75rem' }}>
                            <Activity size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b' }}>Platform Avg. Score</h3>
                    </div>
                    <p style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a' }}>{stats.averageBandScore}</p>
                </div>
            </div>

            {/* Users Table */}
            <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b' }}>User Management</h2>
                </div>

                {users.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        No users registered yet.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: '#f8fafc' }}>
                                <tr>
                                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>User ID</th>
                                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Username</th>
                                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Registered On</th>
                                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem 1.5rem', color: '#64748b' }}>#{user.id}</td>
                                        <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: '#1e293b' }}>{user.username}</td>
                                        <td style={{ padding: '1rem 1.5rem', color: '#64748b' }}>
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                style={{ padding: '0.5rem', color: '#ef4444', background: '#fee2e2', borderRadius: '0.5rem', cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center' }}
                                                title="Delete User"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
