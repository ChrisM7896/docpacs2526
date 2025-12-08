const bcrypt = require('bcrypt');

// Configuration
const SALT_ROUNDS = 12; // Higher = more secure but slower

// Function to hash a plaintext password
async function hashPassword(plaintext) {
    // Your implementation here
    return await bcrypt.hash(plaintext, SALT_ROUNDS);
}

// Function to compare plaintext to hash
async function comparePassword(plaintext, hash) {
    // Your implementation here
    return await bcrypt.compare(plaintext, hash);
}

module.exports = {
    hashPassword,
    comparePassword
};
