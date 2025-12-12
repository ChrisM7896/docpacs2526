// import required modules
const jwt = require('jsonwebtoken');

//import custom modules
const databaseManager = require('../modules/databaseManager');

//retrive environment variables
const PORT = process.env.PORT;
const HOST = process.env.HOST;

function loginRoute(app) {
    app.get('/login', (req, res) => {
        if (req.session.user) {
            res.redirect('/');
            // use formbar token data
        } else if (req.query.token) {
            let tokenData = jwt.decode(req.query.token)
            req.session.token = tokenData
            req.session.user = tokenData.email;
            req.session.displayName = tokenData.displayName;
            req.session.permission = tokenData.permissions;
            console.log(`User ${tokenData.displayName} logged in.`)
            res.redirect('/');
        } else {
            res.render('login');
        }
    });

    app.post('/login', (req, res) => {
        const { username, password } = req.body; // Retrieve username and password from form
        if (username && password) {
            databaseManager.authenticateUser(username, password, req, res);
        }
    });

    app.post('/login/createUser', (req, res) => {
        const { username, displayName, password } = req.body; // Retrieve username and password from form
        if (username && displayName && password) {
            try {
                databaseManager.saveUserData({ username, displayName, password, permissions: 2 });
                req.session.user = username;
                req.session.displayName = displayName;
                res.redirect('/');
            } catch (error) {
                console.error('Error saving user data:', error);
                res.status(500).send('Internal Server Error');
            }
        } else {
            res.status(400).send('Username and password are required');
        }
    });
};

module.exports = loginRoute;