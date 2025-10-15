import fs from 'fs';
import sqlite3 from 'sqlite3';

try {
    const sql = fs.readFileSync('db/init.sql', 'utf8');
    const db = new sqlite3.Database('db/app.db', (err) => {
        if (err) {
            console.error("database no load", err.message);
            return;
        }
    });

    db.exec(sql, (err) => {
        if (err) {
            console.error('Error running database:', err.message);
        } else {
            console.log('Database connect successful.');
        }
        db.close((err) => {
            if (err) {
                console.error('could not close database:', err.message)
            } else {
                console.log('Database close succesful.')
            }
        });
    });
} catch (err) {
    console.log("uh-oh, something really really bad happened:", err.message)
}