import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new Database('database.sqlite');
db.pragma('journal_mode = WAL');

// Initialize schema (simple initialization)
const initDb = () => {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'student',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS research_lines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS protocols (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            general_objective TEXT,
            specific_objectives TEXT,
            research_line_id INTEGER,
            status TEXT DEFAULT 'pending',
            advisor_id INTEGER,
            advisor_status TEXT DEFAULT 'pending',
            checklist_state TEXT DEFAULT '{}',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES users(id),
            FOREIGN KEY (research_line_id) REFERENCES research_lines(id)
        );
        CREATE TABLE IF NOT EXISTS advances (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            protocol_id INTEGER NOT NULL,
            file_name TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            status TEXT DEFAULT 'completed',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (protocol_id) REFERENCES protocols(id)
        );
    `);
    
    // DB migration: Add columns if they do not exist
    try {
        db.exec("ALTER TABLE protocols ADD COLUMN advisor_id INTEGER;");
        db.exec("ALTER TABLE protocols ADD COLUMN advisor_status TEXT DEFAULT 'none';");
    } catch (e) {}

    try {
        db.exec("ALTER TABLE protocols ADD COLUMN checklist_state TEXT DEFAULT '{}';");
    } catch(e) {}
    
    console.log("Database initialized.");
};

initDb();

// Make DB available in request so controllers can use it easily without singleton
app.use((req, res, next) => {
    req.db = db;
    next();
});

// Routes
app.use('/api/auth', authRoutes);

import dashboardRoutes from './routes/dashboardRoutes.js';
import researchLinesRoutes from './routes/researchLinesRoutes.js';
import protocolRoutes from './routes/protocolRoutes.js';
import userRoutes from './routes/userRoutes.js';
import advanceRoutes from './routes/advanceRoutes.js';

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/research-lines', researchLinesRoutes);
app.use('/api/protocols', protocolRoutes);
app.use('/api/users', userRoutes);
app.use('/api/advances', advanceRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'API is running', timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
