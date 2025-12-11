const express = require('express');
const router = express.Router();
const native = require('../modules/auth/native')
const logger = require('../modules/logger');
const formbarAuth = require('../modules/auth/formbarAuth');
const utilities = require('../shared/utilities');

router.get('/login', (req, res) => {
    res.render('login', { errorMessage: null }); // Pass errorMessage as null initially
});

router.post('/login', async (req, res) => {
    const { username, password, method } = req.body;

    try {
        let user = null;

        if (method === 'native') {
            user = await native.authenticate(username, password);
        } else if (method === 'formbar') {
            user = await formbarAuth.authenticate(req, res);
        } else {
            throw new Error('Invalid authentication method');
        }

        if (user) {
            req.session.user = user;
            logger.info(`User ${user.username} logged in successfully via ${method}`);
            res.redirect('/');
        } else {
            res.render('login', { errorMessage: 'Invalid credentials. Please try again.' });
        }
    } catch (error) {
        logger.error(`Login failed: ${error.message}`);
        res.render('login', { errorMessage: 'An error occurred during login. Please try again later.' });
    }
});

router.get('/logout', (req, res) => {
    if (req.session) {
        const username = req.session.user ? req.session.user.username : 'Guest';
        req.session.destroy(err => {
            if (err) {
                logger.error(`Logout error for user ${username}: ${err.message}`);
            } else {
                logger.info(`User ${username} logged out successfully`);
            }
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
});

module.exports = router;