const db = require('../db');
const passwordHashing = require('./passwordHashing');

async function loginUser(username, password) {
    if (!username || !password) return null;
    const user = await db.getAsync('SELECT id, username, passwordHash, formbarId FROM users WHERE username = ?', username);
    if (!user) return null;
    const match = await passwordHashing.comparePassword(password, user.passwordHash);
    if (!match) return null;
    return { id: user.id, username: user.username, formbarId: user.formbarId };
}

async function registerUser(username, password) {
    const existing = await db.getAsync('SELECT id FROM users WHERE username = ?', username);
    if (existing) throw new Error('Username already exists');
    const hash = await passwordHashing.hashPassword(password);
    const stmt = await db.runAsync('INSERT INTO users (username, passwordHash) VALUES (?, ?)', username, hash);
    const id = stmt && stmt.lastID ? stmt.lastID : null;
    return { id, username };
}

module.exports = { loginUser, registerUser };