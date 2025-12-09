const passwordHashing = require('passwordHashing');


async function loginUser(username, password) {
    // Find user in database
    // Compare password using passwordHashing.comparePassword()
    // Return user object or null
}

async function registerUser(username, password) {
    // Check if username already exists
    // Hash password using passwordHashing.hashPassword()
    // Create new user in database
    // Return user object or error
}