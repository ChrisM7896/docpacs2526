const formbarClient = require('./formbarClient'); 
const logger = require('./logger');

// Use ALL your Formbar credentials
const FORMBAR_CLIENT_ID = process.env.FORMBAR_CLIENT_ID;
const FORMBAR_CLIENT_SECRET = process.env.FORMBAR_CLIENT_SECRET;
const FORMBAR_REDIRECT_URI = process.env.FORMBAR_REDIRECT_URI;

// Validate that we have all required credentials
if (!FORMBAR_CLIENT_ID || !FORMBAR_CLIENT_SECRET || !FORMBAR_REDIRECT_URI) {
    throw new Error('Missing required Formbar credentials in environment variables');
}



// 1. Build the authorization URL for redirecting users
async function authenticateWithFormbar(username, password) {
    try {
        logger.info(`Attempting Formbar authentication for user: ${username}`);
        
        // Include client ID in authentication request
        const authData = {
            client_id: FORMBAR_CLIENT_ID,
            username: username,
            password: password
        };
        
        const userData = await formbarClient.authenticateUser(authData);
        
        if (userData) {
            logger.info(`User ${username} successfully authenticated with Formbar`);
            return {
                formbarId: userData.id,
                username: userData.username,
                email: userData.email,
                clientId: FORMBAR_CLIENT_ID // Track which app they authenticated through
            };
        }
        
        return null;
        
    } catch (error) {
        logger.error(`Formbar authentication error for ${username}: ${error.message}`);
        return null;
    }
}

// This should be used in your formbarClient for API requests
async function makeAuthenticatedRequest(endpoint, data = {}) {
    try {
        // Include both client ID and secret for authenticated requests
        const requestData = {
            client_id: FORMBAR_CLIENT_ID,
            client_secret: FORMBAR_CLIENT_SECRET,
            ...data
        };
        
        return await formbarClient.sendRequest(endpoint, {
            method: 'POST',
            body: JSON.stringify(requestData)
        });
        
    } catch (error) {
        logger.error(`Authenticated Formbar request failed: ${error.message}`);
        throw error;
    }
}


async function getFormbarUserById(formbarId) {
    try {
        logger.info(`Fetching Formbar user info for ID: ${formbarId}`);
        
        const userData = await formbarClient.getUser(formbarId);
        
        if (userData) {
            return {
                formbarId: userData.id,
                username: userData.username,
                email: userData.email,
                // Add other properties you need
            };
        }
        
        return null;
        
    } catch (error) {
        logger.error(`Failed to get Formbar user ${formbarId}: ${error.message}`);
        return null;
    }
}

async function loginWithFormbar(username, password) {
    try {
        // 1. Authenticate with Formbar
        const formbarUser = await authenticateWithFormbar(username, password);
        
        if (!formbarUser) {
            return null; // Authentication failed
        }
        
        // 2. Check if user exists in local database
        const localUser = await findUserByFormbarId(formbarUser.formbarId);
        
        if (localUser) {
            // User exists locally, return combined data
            return {
                id: localUser.id,
                username: localUser.username,
                formbarId: formbarUser.formbarId,
                created_at: localUser.created_at
            };
        } else {
            // User doesn't exist locally, create new account
            const newUser = await createUserWithFormbarId(
                formbarUser.username, 
                formbarUser.formbarId
            );
            return newUser;
        }
        
    } catch (error) {
        logger.error(`Formbar login process failed: ${error.message}`);
        return null;
    }
}

// Find user by their Formbar ID
async function findUserByFormbarId(formbarId) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);
        const query = `SELECT * FROM users WHERE formbarId = ?`;
        
        db.get(query, [formbarId], (err, row) => {
            db.close();
            if (err) return reject(err);
            resolve(row || null);
        });
    });
}

// Create user with Formbar ID
async function createUserWithFormbarId(username, formbarId) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);
        const query = `INSERT INTO users (username, formbarId, created_at) VALUES (?, ?, datetime('now'))`;
        
        db.run(query, [username, formbarId], function(err) {
            if (err) {
                db.close();
                return reject(err);
            }
            
            // Get the created user
            const selectQuery = `SELECT * FROM users WHERE id = ?`;
            db.get(selectQuery, [this.lastID], (err, row) => {
                db.close();
                if (err) return reject(err);
                resolve(row);
            });
        });
    });
}
// Find user by their Formbar ID
async function findUserByFormbarId(formbarId) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);
        const query = `SELECT * FROM users WHERE formbarId = ?`;
        
        db.get(query, [formbarId], (err, row) => {
            db.close();
            if (err) return reject(err);
            resolve(row || null);
        });
    });
}

// Create user with Formbar ID
async function createUserWithFormbarId(username, formbarId) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);
        const query = `INSERT INTO users (username, formbarId, created_at) VALUES (?, ?, datetime('now'))`;
        
        db.run(query, [username, formbarId], function(err) {
            if (err) {
                db.close();
                return reject(err);
            }
            
            // Get the created user
            const selectQuery = `SELECT * FROM users WHERE id = ?`;
            db.get(selectQuery, [this.lastID], (err, row) => {
                db.close();
                if (err) return reject(err);
                resolve(row);
            });
        });
    });
}

// Generate authentication URL that redirects back to your app
function generateFormbarAuthUrl(state = null) {
    const params = new URLSearchParams({
        client_id: FORMBAR_CLIENT_ID,
        redirect_uri: FORMBAR_REDIRECT_URI,
        response_type: 'code', // or 'token' depending on Formbar's flow
    });
    
    if (state) {
        params.append('state', state);
    }
    
    // This would be the URL you redirect users to for Formbar login
    const authUrl = `https://formbeta.yorktechapps.com/auth?${params.toString()}`;
    logger.info('Generated Formbar authentication URL');
    return authUrl;
}

// Handle the callback from Formbar
async function handleFormbarCallback(authCode, state = null) {
    try {
        // Exchange auth code for user data
        const tokenData = {
            client_id: FORMBAR_CLIENT_ID,
            client_secret: FORMBAR_CLIENT_SECRET,
            redirect_uri: FORMBAR_REDIRECT_URI,
            code: authCode
        };
        
        const userData = await formbarClient.exchangeToken(tokenData);
        return userData;
        
    } catch (error) {
        logger.error(`Formbar callback handling failed: ${error.message}`);
        return null;
    }
}


module.exports = {
    // Direct authentication
    authenticateWithFormbar,
    getFormbarUserById,
    
    // OAuth-style flow (if supported)
    generateFormbarAuthUrl,
    handleFormbarCallback,
    
    // Utility functions
    makeAuthenticatedRequest,
    
    // Database integration
    loginWithFormbar,
    findUserByFormbarId,
    createUserWithFormbarId
};
