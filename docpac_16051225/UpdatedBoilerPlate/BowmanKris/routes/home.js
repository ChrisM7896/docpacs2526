function homeRoute(app, isAuthenticated, FORMBAR_API_KEY, FORMBAR_AUTH_URL) {
    app.get('/', isAuthenticated, (req, res) => {
        try {
            fetch(`${FORMBAR_AUTH_URL}/api/me`, {
                method: 'GET',
                headers: {
                    'API': FORMBAR_API_KEY,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    res.render('home', {
                        user: req.session.user,
                        token: req.session.token,
                        profile: data
                    });
                })
        }
        catch (error) {
            res.send(error.message)
        }
    });
};

module.exports = homeRoute;