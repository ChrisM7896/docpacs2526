import fs from 'fs';
import sqlite3 from 'sqlite3';

const sql = fs.readFileSync('db/init.sql', 'utf8');
const db = new sqlite3.Database('db/app.db');

db.exec(sql, (err) => {
    if (err) {
        console.error('Error initializing database:', err.message);
    } else {
        console.log('Database initialized successfully.');
    }
    db.close();
});