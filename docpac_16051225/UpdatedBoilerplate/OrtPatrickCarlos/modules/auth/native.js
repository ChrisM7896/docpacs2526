const passwordHashing = require('passwordHashing');
const sqlite3 = require('sqlite3').verbose();
const dbPath = require('path').resolve(__dirname, '../data/database.sqlite');
const path = require('path');


async function findUserInDatabase(username) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);
        const query = `SELECT id, username, passwordHash, formbarId, created_at FROM users WHERE username = ?`; // Verify column name
        db.get(query, [username], (err, row) => {
            db.close();
            if (err) {
                return reject(err);
            }
            resolve(row || null); // Return null if no user is found
        });
    });
}

async function createUserInDatabase(username, passwordHash) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);
        const query = `INSERT INTO users (username, passwordHash, created_at) VALUES (?, ?, datetime('now'))`;
        db.run(query, [username, passwordHash], function(err) {
            if (err) {
                db.close();
                return reject(err);
            }
            const newUserId = this.lastID;
            const selectQuery = `SELECT id, username, formbarId, created_at FROM users WHERE id = ?`;
            db.get(selectQuery, [newUserId], (err, row) => {
                db.close();
                if (err) {
                    return reject(err);
                }
                resolve(row);
            });
        });
    });
}




async function loginUser(username, password) {
    try {
        const user = await findUserInDatabase(username); // Placeholder function
        if (!user) {
            return null; // User not found
        }
        const isPasswordValid = await passwordHashing.comparePassword(password, user.passwordHash);
        if (!isPasswordValid) {
            return null; // Invalid password
        }

        return {
            id: user.id,
            username: user.username,
            formbarId: user.formbarId,
            created_at: user.created_at
        }; 
    } catch (error) {
        // Handle error
        return null;
    }
}

async function registerUser(username, password) {
    try {
        // Check if user already exists
        const existingUser = await findUserInDatabase(username);
        if (existingUser) {
            throw new Error('Username already exists');
        }

        // Hash password
        const hashedPassword = await passwordHashing.hashPassword(password);

        // Create user in database
        const newUser = await createUserInDatabase(username, hashedPassword); // Placeholder function

        return newUser; // Return clean user object
    } catch (error) {
        throw error; // Let the route handle the error
    }
}


module.exports = {
    loginUser,
    registerUser
};
