const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const logger = require('../modules/logger');
const fs = require('fs');
const dbPath = path.resolve(__dirname, '../database/app.db');
const initSqlPath = path.resolve(__dirname, 'init.sql');

function initializeDatabase() {
    return new Promise((resolve, reject) => {
        const dbExists = fs.existsSync(dbPath);
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                logger.error(`Failed to connect to database: ${err.message}`);
                return reject(err);
            }
            logger.info('Connected to the SQLite database.');

            if (!dbExists) {
                fs.readFile(initSqlPath, 'utf8', (err, data) => {
                    if (err) {
                        logger.error(`Failed to read init.sql: ${err.message}`);
                        return reject(err);
                    }

                    db.exec(data, (err) => {
                        if (err) {
                            logger.error(`Failed to initialize database schema: ${err.message}`);
                            return reject(err);
                        }
                        logger.info('Database schema initialized successfully.');
                        resolve(db);
                    });
                });
            } else {
                logger.info('Database already exists. Skipping initialization.');
                resolve(db);
            }
        });
    });
}
module.exports = initializeDatabase;
// Initialize the database when this script is run directly