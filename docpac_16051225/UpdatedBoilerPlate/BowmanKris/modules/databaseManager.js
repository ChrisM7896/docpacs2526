//import required modules
const sqlite3 = require('sqlite3').verbose();

//import custom modules
const { hashPassword, verifyPassword } = require('./passwordHashing');

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

function authenticateUser(username, password, req, res) {
    console.log(`Authenticating user: ${username}`);

    db.get(
        `SELECT * FROM users WHERE username = ?`,
        [username],
        (err, row) => {
            if (err) {
                console.error('Error querying database:', err.message);
            }
            if (!row) {
                console.log(`User ${username} not found.`);
                console.log('Authentication failed for user ' + username);
            }

            const hashedPassword = row.password;;

            console.log(`User ${username} found. Verifying password...`);

            //compare hashed passwords
            if (verifyPassword(password, hashedPassword)) {
                console.log(`Authentication successful for user ${username}`);
                req.session.user = row.username;
                req.session.displayName = row.display_name;
                res.redirect('/');
            } else {
                console.log(`Authentication failed for user ${username}`);
            }
        }
    );
};

//save user data to database
function saveUserData({ createUsername, createDisplayName, permissions, createPassword }) {
    if (!createPassword) {
        console.error('Password is required for hashing.');
        return;
    }

    //hash the password before saving
    const hashedPassword = hashPassword(createPassword)

    db.run(
        `INSERT INTO users (username, display_name, permissions, password) VALUES (?, ?, ?, ?)`,
        [createUsername, createDisplayName, permissions, hashedPassword],
        (err) => {
            if (err) {
                console.error('Error saving user to database:', err.message);
            } else {
                console.log(`User ${createUsername} saved to database.`)
            }
        }
    );
};

module.exports = {
    authenticateUser,
    saveUserData,
};