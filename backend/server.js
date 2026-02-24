const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/test');
const adminRoutes = require('./routes/admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'IELTS Test API is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
