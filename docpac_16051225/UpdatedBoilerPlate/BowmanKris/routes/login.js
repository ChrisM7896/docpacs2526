function loginRoute(app, jwt, FORMBAR_AUTH_URL, REDIRECT_URL) {
    app.get('/login', (req, res) => {
        if (req.query.token) {
            let tokenData = jwt.decode(req.query.token)
            req.session.token = tokenData
            req.session.user = tokenData.displayName
            res.redirect('/')
        } else {
            res.redirect(`${FORMBAR_AUTH_URL}/oauth?redirectURL=${REDIRECT_URL}`);
        }
    });
};

module.exports = loginRoute;