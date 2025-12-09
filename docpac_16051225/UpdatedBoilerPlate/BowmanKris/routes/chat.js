// import custom middleware
const isAuthenticated = require('../middleware/isAuthenticated');

function chatRoute(app) {
    app.get('/chat', (req, res) => {
        try {
            if (req.session.user && isAuthenticated) {
                res.render('sockets', {
                    user: req.session.user
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

module.exports = chatRoute;