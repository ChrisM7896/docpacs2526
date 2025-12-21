const express = require('express');
const router = express.Router();
const nativeAuth = require('../modules/native');

// Show login page
router.get('/login', (req, res) => {
    if (req.session.user) {
        res.redirect('/');
    } else {
        const authUrl = `http://formbeta.yorktechapps.com/oauth?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URL}&response_type=code`;
        
        res.render('login', {
            session: req.session,
            AUTH_URL: authUrl,
            loginError: false
        });
    }
});

// Handle local authentication
router.post('/auth/local', (req, res) => {
    const { username, password } = req.body;
    
    nativeAuth.authenticateUser(username, password, (err, user) => {
        if (err) {
            console.error('Authentication error:', err);
            return res.status(500).send('Database error');
        }
        if (user) {
            req.session.user = user;
            res.redirect('/');
        } else {
            res.render('login', {
                session: req.session,
                AUTH_URL: process.env.AUTH_URL,
                loginError: true
            });
        }
    });
});

module.exports = router;
