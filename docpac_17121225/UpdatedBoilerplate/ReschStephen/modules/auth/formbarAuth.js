// Imports
import express from 'express';
const app = express();
import { logging } from './modules/logger.js';
import jwt from 'jsonwebtoken';
import e from 'express';

// Handle OAuth redirect flow
app.get('/login', (req, res) => {
    logging('INFO', `Login request received with query: ${JSON.stringify(req.query)}`);
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.displayName;
        logging('INFO', `User ${tokenData.displayName} logged in successfully.`);
        res.redirect('/profile');
    } else {
        res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`);
    }
});

app.get('/home', (req, res) => {
    try {
        res.render('home', { user: req.session.user });
    } catch (error) {
        logging('ERROR', `Error rendering home page: ${error.message}`);
        res.send(error.message);
    }
    const loggedIn = req.session.user ? true : false;
    res.render('home', { user: req.session.user, loggedIn: loggedIn });
});

app.get('/profile', (req, res) => {
    if (req.session.token) {
        db.get('SELECT * FROM users WHERE fb_name = ?', [req.session.user], (err, row) => {
            if (err) {
                logging('ERROR', `Database error: ${err.message}`);
                return console.error(err.message);
            }
            if (!row) {
                db.run('INSERT INTO users(fb_name, profile_checked) VALUES(?, ?)', [req.session.user, 0], function (err) {
                    if (err) {
                        logging('ERROR', `Error inserting new user: ${err.message}`);
                        return console.error(err.message);
                    }
                    logging('INFO', `New user ${req.session.user} inserted with rowid ${this.lastID}`);
                    res.render('profile', { user: req.session.token, check: JSON.stringify(0) });
                });
            } else {
                res.render('profile', { user: req.session.token, check: JSON.stringify(row) });
            }
        });
    } else {
        logging('WARN', 'Unauthorized access to profile page.');
        res.send('Unauthorized access.');
    }
});

export default app;

// Build authorization URL
function buildAuthURL() {
    const params = new URLSearchParams({
        client_id: process.env.FB_CLIENT_ID,
        redirect_uri: process.env.FB_REDIRECT_URI,
        response_type: 'code',
    });
    return `https://www.formbar.yorktechapps.com/oauth?${params.toString()}`;
}
const AUTH_URL = buildAuthURL();
const THIS_URL = process.env.FB_REDIRECT_URI;

export { AUTH_URL, THIS_URL };

// Handle callback route
app.get('/callback', (req, res) => {
    const authCode = req.query.code;
    if (!authCode) {
        logging('ERROR', 'No authorization code received in callback.');
        return res.status(400).send('Authorization code is missing.');
    }
    // Exchange auth code for access token
    fetch(`${AUTH_URL}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            client_id: process.env.FB_CLIENT_ID,
            client_secret: process.env.FB_CLIENT_SECRET,
            redirect_uri: THIS_URL,
            code: authCode,
            grant_type: 'authorization_code',
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.access_token) {
                const tokenData = jwt.decode(data.access_token);
                req.session.token = tokenData;
                req.session.user = tokenData.displayName;
                logging('INFO', `User ${tokenData.displayName} authenticated successfully.`);
                res.redirect('/profile');
            } else {
                logging('ERROR', 'Failed to obtain access token.');
                res.status(500).send('Failed to obtain access token.');
            }
        })
        .catch(error => {
            logging('ERROR', `Error during token exchange: ${error.message}`);
            res.status(500).send('Error during authentication process.');
        });
});

// Exchange authorization code for tokens and user info
async function exchangeAuthCodeForToken(authCode) {
    try {
        const response = await fetch(`${AUTH_URL}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: process.env.FB_CLIENT_ID,
                client_secret: process.env.FB_CLIENT_SECRET,
                redirect_uri: THIS_URL,
                code: authCode,
                grant_type: 'authorization_code',
            }),
        });
        const data = await response.json();
        if (data.access_token) {
            logging('INFO', 'Access token obtained successfully.');
            return jwt.decode(data.access_token);
        } else {
            logging('ERROR', 'Failed to obtain access token.');
            throw new Error('Failed to obtain access token.');
        }
    } catch (error) {
        logging('ERROR', `Error during token exchange: ${error.message}`);
        throw error;
    }
}

export { exchangeAuthCodeForToken };

// Link formbar user identity to local user database
export function linkFormbarUserToLocalDB(db, fbName, callback) {
    const query = `SELECT * FROM users WHERE fb_name = ?`;
    db.get(query, [fbName], function (err, row) {
        if (err) {
            logging('ERROR', `Error fetching user: ${err}`);
            return callback(err);
        }
        if (!row) {
            const insertQuery = `INSERT INTO users (fb_name, profile_checked) VALUES (?, ?)`;
            db.run(insertQuery, [fbName, 0], function (err) {
                if (err) {
                    logging('ERROR', `Error linking user: ${err}`);
                    return callback(err);
                }
                logging('INFO', `User ${fbName} linked successfully.`);
                callback(null);
            });
        } else {
            logging('INFO', `User ${fbName} already linked.`);
            callback(null);
        }
    });
}

