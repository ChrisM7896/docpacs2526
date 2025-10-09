const jwt = require ('jsonwebtoken');
const session = require ('express-session');
const express = require ('express');
const bodyParser = require ('body-parser');
const sqlite3 = require ('sqlite3').verbose ();
const app = express ();
const port = process.env.port || 3000;
const AUTH_URL = 'https://formbeta.yorktechapps.com';
const THIS_URL = 'http://localhost:3000/login';
const API_key =  'api_key_here';
const db = new sqlite3.Database('./users.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(err.message);
    }
});

// Set view engine
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware
app.use(session({
    secret: 'fried_monkey_nuts',
    resave: false,
    saveUninitialized: false,
}))
// is authenticated function
function isAuthenticated (req, res, next) {
    if (req.session.user) next()
    else res.redirect ('/login')
};
// '/' endpoint
app.get ('/', isAuthenticated, (req, res) => {
    try {
        res.render('index.ejs', {user: req.session.user});
    }
    catch (error) {
        res.send(error.message);
    }
});
// login endpoint
app.get ('/login', (req, res) => {
    if (req.session.user) { res.redirect ('/'); return; }
    if (req.query.token) {
        let tokenData = jwt.decode (req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.displayName;
        res.redirect ('/profile');
    } else {
        res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`)
    }
});
// profile endpoint
app.get ('/profile', isAuthenticated, (req, res) => {
    try {
        db.get (`SELECT * FROM users WHERE fb_id = ?`, [req.session.token.id], (err, row) => {
            if (err) {
                return console.error(err.message);
            }
            if (row) {
                res.render('profile.ejs', {user: req.session.user, check: JSON.stringify(row.profile_checked)});
            }
        });
    }
    catch (error) {
        res.send(error.message);
    }
})
// profile post endpoint    
app.post ('/profile', isAuthenticated, bodyParser.urlencoded({ extended: false }), (req, res) => {
    console.log('req.body:', req.body);
    const user = req.session.user;
    const userId = req.session.token.id;
    const profileChecked = req.body.profileChecked;
    db.run(`INSERT INTO users (fb_name, fb_id, profile_checked) VALUES (?, ?, ?)
            ON CONFLICT(fb_id) DO UPDATE SET  fb_name=excluded.fb_name, fb_id=excluded.fb_id, profile_checked=excluded.profile_checked ;`,
            [user, userId, profileChecked], function(err) {
        if (err) {
            return console.error(err.message);
        }
        else {
            console.log('user, id, profile_checked:', user, userId, profileChecked);
        }    
        res.redirect ('/profile');
        
    });
});

app.listen (port, () => {
    console.log (`Server running on http://localhost:3000`);
});

