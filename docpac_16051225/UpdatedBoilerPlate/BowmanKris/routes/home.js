// import custom middleware
const isAuthenticated = require('../middleware/isAuthenticated');

function homeRoute(app) {
    app.get('/', (req, res) => {
        try {
            if (!req.session.user) {
                res.render('login');
            } else {
                res.render('home', {
                    user: req.session.user
                });
            };
        }
        catch (error) {
            res.send(error.message)
        }
    });
};

module.exports = homeRoute;