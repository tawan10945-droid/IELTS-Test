const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_ielts';

// Middleware to check admin role
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Verify role in database
        db.get('SELECT role FROM users WHERE id = ?', [decoded.userId], (err, user) => {
            if (err || !user) {
                return res.status(401).json({ error: 'Invalid token.' });
            }
            if (user.role !== 'admin') {
                return res.status(403).json({ error: 'Access denied. Admin only.' });
            }
            req.user = decoded;
            next();
        });
    } catch (error) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};

// Apply middleware to all admin routes
router.use(authenticateAdmin);

// Get overview stats
router.get('/stats', (req, res) => {
    db.get('SELECT COUNT(*) as totalUsers FROM users WHERE role = "user"', [], (err, userCount) => {
        if (err) return res.status(500).json({ error: 'Database error' });

        db.get('SELECT COUNT(*) as totalTests, AVG(band_score) as avgScore FROM results', [], (err, testStats) => {
            if (err) return res.status(500).json({ error: 'Database error' });

            res.json({
                totalUsers: userCount.totalUsers,
                totalTests: testStats.totalTests || 0,
                averageBandScore: testStats.avgScore ? testStats.avgScore.toFixed(1) : 0
            });
        });
    });
});

// Get all users
router.get('/users', (req, res) => {
    db.all('SELECT id, username, created_at FROM users WHERE role = "user" ORDER BY created_at DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

// Delete user and their results
router.delete('/users/:id', (req, res) => {
    const userId = req.params.id;

    // First delete user's results
    db.run('DELETE FROM results WHERE user_id = ?', [userId], function (err) {
        if (err) return res.status(500).json({ error: 'Error deleting user results' });

        // Then delete the user
        db.run('DELETE FROM users WHERE id = ?', [userId], function (err) {
            if (err) return res.status(500).json({ error: 'Error deleting user' });
            if (this.changes === 0) return res.status(404).json({ error: 'User not found' });

            res.json({ message: 'User deleted successfully' });
        });
    });
});

module.exports = router;
