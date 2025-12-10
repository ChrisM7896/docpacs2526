//import required modules
const sqlite3 = require('sqlite3').verbose();

//import custom modules
const passwordHashing = require('./passwordHashing');

//retrive environment variables
const DATABASE_DIR = process.env.DATABASE_DIR;

if (!DATABASE_DIR) {
    console.error('DATABASE_DIR environment variable is not set.');
    process.exit(1);
}

const db = new sqlite3.Database(DATABASE_DIR, (err) => {
    if (err) {
        console.error('Could not connect to database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

function authenticateUser(username, password) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM users WHERE username = ?`,
            [username],
            (err, row) => {
                if (err) {
                    console.error('Error querying database:', err.message);
                    return reject(new Error('Error querying database: ' + err.message));
                }

                if (!row) {
                    console.log(`User ${username} not found.`);
                    return resolve(false);
                }

                const hashedPassword = row.password;

                //compare hashed passwords
                const bcrypt = require('bcrypt');
                bcrypt.compare(password, hashedPassword, (err, result) => {
                    if (err) {
                        console.error('Error comparing passwords:', err.message);
                        return reject(new Error('Error comparing passwords: ' + err.message));
                    }

                    if (result) {
                        console.log(`User ${username} authenticated successfully.`);
                        resolve(true);
                    } else {
                        console.log(`Authentication failed for user ${username}.`);
                        resolve(false);
                    }
                });
            }
        );
    });
}

//save user data to database
function saveUserData({ username, displayName, permissions, password }) {
    return new Promise((resolve, reject) => {
        if (!password) {
            console.error('Password is required for hashing.');
            return;
        }

        //hash the password before saving
        const hashedPassword = passwordHashing(password)

        db.run(
            `INSERT INTO users (username, display_name, permissions, password) VALUES (?, ?, ?, ?)`,
            [username, displayName, permissions, hashedPassword],
            (err) => {
                if (err) {
                    console.error('Error saving user to database:', err.message);
                    return reject(new Error('Error saving user to database: ' + err.message));
                } else {
                    console.log(`User ${username} saved to database.`);
                    resolve();
                }
            }
        );
    });
};

module.exports = {
    authenticateUser,
    saveUserData,
};