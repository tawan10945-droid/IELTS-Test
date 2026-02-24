const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'ielts.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // Ensure tables exist
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, () => {
                // Try to add the role column for existing databases (will error safely if it already exists)
                db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'", (err) => {
                    // Ignore error if column already exists

                    // Ensure default admin exists using environment variables
                    const adminUser = process.env.ADMIN_USERNAME || 'admin';
                    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

                    const bcrypt = require('bcryptjs');
                    const adminPassword = bcrypt.hashSync(adminPass, 10);
                    db.run('INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)', [adminUser, adminPassword, 'admin']);
                });
            });

            db.run(`CREATE TABLE IF NOT EXISTS results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                score INTEGER NOT NULL,
                band_score REAL NOT NULL,
                test_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`);
        });
    }
});

module.exports = db;
