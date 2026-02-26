const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_ielts';

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Map raw score (out of 30) to IELTS Band Score
const calculateBandScore = (score) => {
    if (score >= 29) return 9.0;
    if (score >= 27) return 8.5;
    if (score >= 25) return 8.0;
    if (score >= 23) return 7.5;
    if (score >= 20) return 7.0;
    if (score >= 17) return 6.5;
    if (score >= 14) return 6.0;
    if (score >= 11) return 5.5;
    if (score >= 8) return 5.0;
    if (score >= 6) return 4.5;
    if (score >= 4) return 4.0;
    return 0.0;
};

// 30 Realistic IELTS Simulation Questions
const ieltsQuestions = [
    { id: 1, text: "Despite the bad weather, they _____ to go hiking.", options: ["decides", "deciding", "decided", "have decided"], correctAnswer: 2 },
    { id: 2, text: "By the time we arrive at the station, the train _____.", options: ["will leave", "has left", "will have left", "left"], correctAnswer: 2 },
    { id: 3, text: "If I _____ you were coming, I would have baked a cake.", options: ["knew", "know", "had known", "have known"], correctAnswer: 2 },
    { id: 4, text: "The company's profits have _____ significantly over the last quarter.", options: ["decreased", "declining", "dwindle", "collapse"], correctAnswer: 0 },
    { id: 5, text: "She is highly _____ in several programming languages.", options: ["proficient", "fluent", "capable", "learned"], correctAnswer: 0 },
    { id: 6, text: "The new regulation will have a profound _____ on the local economy.", options: ["affect", "effect", "result", "consequence"], correctAnswer: 1 },
    { id: 7, text: "The professor asked the students to _____ their assignments by Friday.", options: ["hand out", "hand over", "hand in", "hand down"], correctAnswer: 2 },
    { id: 8, text: "It is essential that every student _____ a uniform.", options: ["wears", "wear", "wearing", "to wear"], correctAnswer: 1 },
    { id: 9, text: "Hardly _____ closed my eyes when the telephone rang.", options: ["I had", "had I", "I", "did I"], correctAnswer: 1 },
    { id: 10, text: "He was accused _____ stealing the confidential documents.", options: ["for", "of", "with", "about"], correctAnswer: 1 },
    { id: 11, text: "The architecture of the building is highly _____, featuring unique modern elements.", options: ["innovative", "ancient", "redundant", "ordinary"], correctAnswer: 0 },
    { id: 12, text: "_____ being exhausted, she managed to finish the marathon.", options: ["Although", "In spite of", "However", "Because of"], correctAnswer: 1 },
    { id: 13, text: "The committee will _____ the proposal before making a final decision.", options: ["look up", "look into", "look after", "look out"], correctAnswer: 1 },
    { id: 14, text: "The manager was _____ when he found out about the massive data breach.", options: ["furious", "delighted", "indifferent", "apathetic"], correctAnswer: 0 },
    { id: 15, text: "We need to _____ the root cause of the problem to prevent it from happening again.", options: ["identify", "predict", "ignore", "conceal"], correctAnswer: 0 },
    { id: 16, text: "The researchers conducted a _____ study on the effects of climate change.", options: ["comprehensive", "trivial", "superficial", "fleeting"], correctAnswer: 0 },
    { id: 17, text: "I would rather you _____ not tell anyone about this secret.", options: ["do", "did", "have", "are"], correctAnswer: 1 },
    { id: 18, text: "The rapid _____ of technology has changed how we communicate.", options: ["evolution", "stagnation", "regression", "decline"], correctAnswer: 0 },
    { id: 19, text: "Students are expected to _____ strictly to the school's code of conduct.", options: ["comply", "follow", "adhere", "obey"], correctAnswer: 2 },
    { id: 20, text: "The government has implemented _____ measures to control inflation.", options: ["stringent", "lenient", "flexible", "loose"], correctAnswer: 0 },
    { id: 21, text: "Not only _____ the exam, but she also got the highest score.", options: ["did she pass", "she passed", "she did pass", "passed she"], correctAnswer: 0 },
    { id: 22, text: "The factory has been releasing toxic _____ into the nearby river.", options: ["emissions", "effluents", "pollutants", "smog"], correctAnswer: 2 },
    { id: 23, text: "Please ensure that your seatbelt is securely _____ before takeoff.", options: ["fastened", "tightened", "attached", "bound"], correctAnswer: 0 },
    { id: 24, text: "The team is working _____ to meet the project deadline.", options: ["hardly", "lazily", "diligently", "scarcely"], correctAnswer: 2 },
    { id: 25, text: "Many species are on the _____ of extinction due to habitat loss.", options: ["border", "edge", "brink", "margin"], correctAnswer: 2 },
    { id: 26, text: "She couldn't attend the conference _____ a sudden family emergency.", options: ["because", "owing to", "since", "as"], correctAnswer: 1 },
    { id: 27, text: "The novel was so _____ that I couldn't put it down until I finished it.", options: ["tedious", "monotonous", "gripping", "bland"], correctAnswer: 2 },
    { id: 28, text: "It's imperative to _____ the data before making any strategic decisions.", options: ["synthesize", "analyze", "fabricate", "compromise"], correctAnswer: 1 },
    { id: 29, text: "Due to unforeseen _____, the outdoor concert has been canceled.", options: ["circumstances", "occurrences", "scenarios", "incidents"], correctAnswer: 0 },
    { id: 30, text: "The CEO gave a _____ presentation that clearly outlined the company's future.", options: ["vague", "coherent", "ambiguous", "perplexing"], correctAnswer: 1 }
];

// Get Questions (Hide correct answers from frontend)
router.get('/questions', authMiddleware, (req, res) => {
    const clientQuestions = ieltsQuestions.map(q => ({
        id: q.id,
        text: q.text,
        options: q.options
    }));
    res.json(clientQuestions);
});

// Submit Test
router.post('/submit', authMiddleware, async (req, res) => {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: 'Answers must be provided as an array' });
    }

    let score = 0;
    for (let i = 0; i < ieltsQuestions.length; i++) {
        if (answers[i] === ieltsQuestions[i].correctAnswer) {
            score++;
        }
    }

    const bandScore = calculateBandScore(score);

    try {
        const [result] = await pool.query(
            'INSERT INTO results (user_id, score, band_score) VALUES (?, ?, ?)',
            [req.user.userId, score, bandScore]
        );
        res.status(201).json({
            message: 'Test submitted successfully',
            resultId: result.insertId,
            score,
            bandScore,
            total: 30
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save test result' });
    }
});

// Get user history
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM results WHERE user_id = ? ORDER BY test_date DESC',
            [req.user.userId]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Get Leaderboard (Ranking)
router.get('/leaderboard', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT users.username, MAX(results.score) as highest_score, MAX(results.band_score) as highest_band, results.test_date
            FROM results
            JOIN users ON results.user_id = users.id
            GROUP BY users.id, users.username, results.test_date
            ORDER BY highest_score DESC, results.test_date ASC
            LIMIT 10
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Get Answers (Solutions)
router.get('/answers', authMiddleware, (req, res) => {
    const solutions = ieltsQuestions.map(q => ({
        id: q.id,
        correctAnswer: q.correctAnswer
    }));
    res.json(solutions);
});

module.exports = router;
