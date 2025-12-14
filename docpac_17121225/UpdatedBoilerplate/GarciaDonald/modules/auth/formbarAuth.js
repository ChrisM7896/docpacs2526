// handling OAUTH redirect flow from Formbar
const express = require('express');
const router = express.Router();
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

router.get('/auth/callback', (req, res) => {
    const authCode = req.query.code;
    if (!authCode) {
        return res.status(400).send('Authorization code missing');
    }
    
    // exchange auth code for access token
    axios.post('http://formbeta.yorktechapps.com/oauth/token', {
        code: authCode,
        client_id: process.env.CLIENT_ID,        // Fixed variable name
        client_secret: process.env.CLIENT_SECRET, // Fixed - not SESSION_SECRET!
        redirect_uri: process.env.REDIRECT_URL,   // Fixed variable name
        grant_type: 'authorization_code'
    })
    .then(response => {
        const accessToken = response.data.access_token;
        // fetch user info from Formbar
        return axios.get('http://formbeta.yorktechapps.com/api/user', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
    })
    .then(response => {
        const formbarUser = response.data;
        // check if user exists in local database
        const query = `SELECT * FROM users WHERE formbarID = ?`; // Fixed field name
        db.get(query, [formbarUser.id], (err, row) => {
            if (err) {
                return res.status(500).send('Database error');
            }
            if (row) {
                // user exists, set session
                req.session.user = row;
                res.redirect('/');
            } else {
                // user does not exist, create new user
                const insertQuery = `INSERT INTO users (username, formbarID, passwordHash, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`;
                const now = Date.now();
                db.run(insertQuery, [formbarUser.username, formbarUser.id, null, now, now], function(err) {
                    if (err) {
                        return res.status(500).send('Database error');
                    }
                    // set session for new user
                    req.session.user = {
                        id: this.lastID,
                        username: formbarUser.username,
                        formbarID: formbarUser.id // Fixed field name
                    };
                    res.redirect('/');
                });
            }   
        });
    })
    .catch(error => {
        console.error('Error during authentication', error);
        res.status(500).send('Authentication error');
    });
});

module.exports = router;
