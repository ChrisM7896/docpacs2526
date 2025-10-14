// server.js
const express = require('express');
const path = require('path');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;

const AUTH_URL = process.env.FORMBAR_URL || 'https://formbeta.yorktechapps.com';
const THIS_URL = process.env.THIS_URL || `http://localhost:${port}/login`;
const API_KEY = process.env.FORMBAR_API_KEY || '';
const SESSION_SECRET = process.env.SESSION_SECRET || 'replace_this_with_env_secret';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

const db = new sqlite3.Database(path.join(__dirname, 'formbar.db'), (err) => {
  if (err) return console.error('DB open error:', err);
  console.log('Connected to SQLite DB');
});

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    fb_name TEXT,
    fb_id TEXT UNIQUE,
    profile_checked INTEGER DEFAULT 0
  )
`, (err) => {
  if (err) console.error('Error creating users table:', err);
});

function extractNameAndIdFromToken(tokenData) {
  const name = tokenData.displayName || tokenData.name || tokenData.username || tokenData.fb_name || '';
  const id = tokenData.id || tokenData.sub || tokenData.userId || tokenData.fb_id || '';
  return { name, id };
}

function isAuthenticated(req, res, next) {
  if (req.session.user && req.session.user.fb_id) {
    next();
  } else {
    res.redirect(`/login`);
  }
}


app.get('/', isAuthenticated, (req, res) => {
  const apiUrl = `${AUTH_URL}/api/me`;

  if (API_KEY) {
    fetch(apiUrl, {
      method: 'GET',
      headers: {
        'API': API_KEY,
        'Content-Type': 'application/json'
      }
    })
    .then(r => r.json())
    .then(remoteUser => {
      res.render('index', { user: req.session.user, remoteUser });
    })
    .catch(err => {
      console.warn('Failed to fetch /api/me:', err);
      res.render('index', { user: req.session.user, remoteUser: null });
    });
  } else {
    res.render('index', { user: req.session.user, remoteUser: null });
  }
});

app.get('/login', (req, res) => {
  if (req.query.token) {
    try {
      const tokenData = jwt.decode(req.query.token) || {};
      const { name, id } = extractNameAndIdFromToken(tokenData);

      if (!id) {
        return res.status(400).send('Token did not include a usable user id.');
      }

      req.session.token = tokenData;
      req.session.user = { fb_name: name, fb_id: id };

      db.get('SELECT * FROM users WHERE fb_id = ?', [id], (err, row) => {
        if (err) {
          console.error('DB select error:', err);
          return res.redirect('/');
        }
        if (!row) {
          db.run('INSERT INTO users (fb_name, fb_id, profile_checked) VALUES (?, ?, 0)', [name, id], (err2) => {
            if (err2) console.error('DB insert error:', err2);
            return res.redirect('/profile');
          });
        } else {
          return res.redirect('/profile');
        }
      });
    } catch (err) {
      console.error('Error decoding token', err);
      return res.status(400).send('Invalid token');
    }
  } else {
    const redirect = `${AUTH_URL}/oauth?redirectURL=${encodeURIComponent(THIS_URL)}`;
    return res.redirect(redirect);
  }
});

app.get('/profile', isAuthenticated, (req, res) => {
  const fb_id = req.session.user.fb_id;

  db.get('SELECT * FROM users WHERE fb_id = ?', [fb_id], (err, row) => {
    if (err) {
      console.error('DB get error:', err);
      return res.status(500).send('Database error');
    }

    if (!row) {
      db.run('INSERT INTO users (fb_name, fb_id, profile_checked) VALUES (?, ?, 0)', [req.session.user.fb_name, fb_id], (err2) => {
        if (err2) console.error('DB insert error:', err2);
        return res.render('profile', { fb_name: req.session.user.fb_name, fb_id, profile_checked: 0 });
      });
    } else {
      res.render('profile', { fb_name: row.fb_name || req.session.user.fb_name, fb_id: row.fb_id, profile_checked: row.profile_checked ? 1 : 0 });
    }
  });
});

app.post('/profile', isAuthenticated, (req, res) => {
  const fb_id = req.session.user.fb_id;
  const checked = req.body.profile_checked === 'on' ? 1 : 0;

  db.run('UPDATE users SET profile_checked = ? WHERE fb_id = ?', [checked, fb_id], function(err) {
    if (err) {
      console.error('DB update error:', err);
      return res.status(500).send('Database error when updating');
    }
    return res.redirect('/profile');
  });
});

app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`);
});
