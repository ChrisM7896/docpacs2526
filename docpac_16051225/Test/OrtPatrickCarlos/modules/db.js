const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const util = require('util');

const dbFile = process.env.DATABASE_FILE || path.resolve(__dirname, '../data/database.sqlite');
const db = new sqlite3.Database(dbFile);

// Promisify common methods
db.runAsync = util.promisify(db.run.bind(db));
db.getAsync = util.promisify(db.get.bind(db));
db.allAsync = util.promisify(db.all.bind(db));

module.exports = db;
