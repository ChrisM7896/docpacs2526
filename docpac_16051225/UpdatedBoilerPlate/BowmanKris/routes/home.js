function homeRoute(app, isAuthenticated) {
    app.get('/', isAuthenticated, (req, res) => {
        try {
            res.render('home', {
                user: req.session.user
            });
        }
        catch (error) {
            res.send(error.message)
        }
    });
};

module.exports = homeRoute;