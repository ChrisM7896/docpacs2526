const express = require('express');
const router = express.Router();
const nativeAuth = require('../modules/auth/native');
const formbarAuth = require('../modules/auth/formbarAuth');
const logger = require('../modules/logger');

router.get('/login', (req, res) => {
  res.render('login', { errorMessage: null });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await nativeAuth.loginUser(username, password);
    if (!user) return res.render('login', { errorMessage: 'Invalid username or password' });
    req.session.user = user;
    logger.info(`User logged in: ${user.username}`);
    return res.redirect('/');
  } catch (err) {
    logger.error('Login error: ' + err.message);
    return res.render('login', { errorMessage: 'An error occurred' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// Formbar OAuth flow
router.get('/auth/formbar', (req, res) => {
  const url = formbarAuth.buildAuthUrl();
  res.redirect(url);
});

router.get('/auth/formbar/callback', async (req, res) => {
  const code = req.query.code;
  try {
    const user = await formbarAuth.handleCallback(code);
    req.session.user = user;
    res.redirect('/');
  } catch (err) {
    logger.error('Formbar callback error: ' + err.message);
    res.redirect('/login');
  }
});

module.exports = router;
