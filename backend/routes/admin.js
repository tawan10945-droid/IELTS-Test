const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_ielts';

// Middleware to check admin role
const authenticateAdmin = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const [rows] = await pool.query('SELECT role FROM users WHERE id = ?', [decoded.userId]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid token.' });
        }
        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};

// Apply middleware to all admin routes
router.use(authenticateAdmin);

// Get overview stats
router.get('/stats', async (req, res) => {
    try {
        const [[userCount]] = await pool.query('SELECT COUNT(*) as totalUsers FROM users WHERE role = "user"');
        const [[testStats]] = await pool.query('SELECT COUNT(*) as totalTests, AVG(band_score) as avgScore FROM results');

        res.json({
            totalUsers: userCount.totalUsers,
            totalTests: testStats.totalTests || 0,
            averageBandScore: testStats.avgScore ? parseFloat(testStats.avgScore).toFixed(1) : 0
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get all users
router.get('/users', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, username, created_at FROM users WHERE role = "user" ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Delete user and their results
router.delete('/users/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        // First delete user's results
        await pool.query('DELETE FROM results WHERE user_id = ?', [userId]);

        // Then delete the user
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error deleting user' });
    }
});

module.exports = router;
