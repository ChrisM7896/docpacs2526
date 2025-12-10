// Imports
import 'dotenv/config';
import { logging } from './modules/logger.js';
import sessionMiddleware from './middleware/session.js';
import express from 'express';
const app = express();
import session from 'express-session';
import sqlite3Package from 'sqlite3';
const sqlite3 = sqlite3Package.verbose();
import connectSqlite3 from 'connect-sqlite3';
const SQLiteStore = connectSqlite3(session);

app.use(sessionMiddleware);

// Database setup
const db = new sqlite3.Database('./data/database.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        logging('INFO', 'Connected to SQLite database.');
    }
});

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
