// import custom middleware
const isAuthenticated = require('../middleware/isAuthenticated');

function socketRoute(app) {
    app.get('/socket', (req, res) => {
        try {
            if (req.session.user && isAuthenticated) {
                res.render('socket', {
                    user: req.session.user,
                    displayName: req.session.displayName,
                    avatarPath: req.session.avatarPath
                });
            } else {
                res.render('login');
            }
        }
        catch (error) {
            res.send(error.message)
        }
    });
};

module.exports = socketRoute;