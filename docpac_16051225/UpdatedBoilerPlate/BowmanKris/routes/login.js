// import required modules
const jwt = require('jsonwebtoken');

//retrive environment variables
const PORT = process.env.PORT;
const HOST = process.env.HOST;
const FORMBAR_AUTH_URL = process.env.FORMBAR_AUTH_URL;
const REDIRECT_URL = `${HOST}${PORT}/login`;

function loginRoute(app) {
    app.get('/login', (req, res) => {
        if (req.query.token) {
            console
            let tokenData = jwt.decode(req.query.token)
            req.session.token = tokenData
            req.session.user = tokenData.email;
            req.session.displayName = tokenData.displayName;
            req.session.permission = tokenData.permissions;
            console.log(`User ${tokenData.displayName} logged in.`)
            res.redirect('/')
        } else if (req.session.user) {
            res.redirect('/');
        } else {
            res.redirect(`${FORMBAR_AUTH_URL}/oauth?redirectURL=${REDIRECT_URL}`);
        }
    });

    app.post('/login', (req, res) => {
        const { username, password } = req.body; // Retrieve username and password from form
        if (username && password) {
            console.log(`Username: ${username}, Password: ${password}`);
            //refer to database to validate credentials

            //if user does not exist, display "User does not exist. Would you like to create a new account?" And if the user hits yes, create a new account
            

            //if user exists and credentials are valid, set session
            req.session.user = username; //set the user in session
            res.redirect('/');
        } else {
            res.status(400).send('Username and password are required');
        }
    });
};

module.exports = loginRoute;