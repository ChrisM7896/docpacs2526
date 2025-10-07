const { name } = require('ejs');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./dataPlace.db', (err) => {
  console.log('Connected to the SQLite database.');
});
const jwt = require('jsonwebtoken');
const session = require('express-session');
const AUTH_URL = 'http://localhost:420';
const THIS_URL = 'http://localhost:3000/login';
const CLIENT_ID = 'gotanycardsfriend';
const CLIENT_SECRET = 'murderforthemoderntimes';
const API_KEY = '53519948f6e68b05134e406a6b21cee4970c41f940d77c11ec24c28dc29441b5'
const app = express();
const fs = require('fs');

app.use(session({
  secret: 'Radical man thats totallt tubalar my man!',
  resave: false,
  saveUninitialized: false
}))
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.set('view engine', 'ejs');

function isAuthenticated(req, res, next) {
  console.log("auth check")
  console.log(req.session)
  console.log(req.session.user)
  if (req.session.user) next()
  else res.redirect(`/login?redirectURL=${THIS_URL}`)
};

app.get('/', isAuthenticated, (req, res) => {
  console.log("Root")
	try {
		fetch(`${FBJS_URL}/api/me`, {
			method: 'GET',
			headers: {
				'API': API_KEY,
				'Content-Type': 'application/json'
			}
		})
			.then(response => {
				return response.json();
			})
			.then(data => {
				res.send(data);
			})
	}
	catch (error) {
		res.send(error.message)
	}
});

app.get('/login', (req, res) => {
  console.log(req.query.token)
  if (req.query.token) {
    let tokenData = jwt.decode(req.query.token);
    req.session.token = tokenData;
    req.session.user = tokenData.displayName;
    res.redirect('/profile',tokname=`${tokenData.displayName}` ,fbid=`${tokenData.id}`);

} else {
    res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`)
};
});

app.get('/profile', (req, res) => {
  res.render('profile');
});

app.post('/profile', (req, res) => {
  nametosend = req.body.tokname
  idtosend = req.body.fbid
  console.log(req.body.tokname)
  console.log(req.body.confirmCheckbox)
  console.log(nametosend)
  console.log(idtosend)
  db.run(`INSERT INTO users (fbname,fbid) VALUES (?, ?)`, [nametosend, idtosend], function(err) {
    if (err) {
      return console.log(err.message + " this probaly means you already checked your profile"); 
    }
    console.log(`A row has been inserted with rowid ${this.lastID}`);
    res.send('Profile saved!');
  });
  db.run(`UPDATE users SET profilechecked = 1 WHERE fbname = ?`, [nametosend], function(err) {
    if (err) {
      return console.log(err.message);
    }
    console.log(`A row has been updated with rowid ${this.lastID}`);
  });
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});