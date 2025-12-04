function isAuthenticated(req, res, next, FORMBAR_AUTH_URL, REDIRECT_URL) {
    if (req.session.user) {
        const tokenData = req.session.token;

        try {
            // Check if the token has expired
            const currentTime = Math.floor(Date.now() / 1000);
            if (tokenData.exp < currentTime) {
                throw new Error('Token has expired');
            }

            next();
        } catch (err) {
            res.redirect(`${FORMBAR_AUTH_URL}/oauth?refreshToken=${tokenData.refreshToken}&redirectURL=${REDIRECT_URL}`);
        }
    } else {
        res.redirect(`/login?redirectURL=${REDIRECT_URL}`);
    }
};

module.exports = isAuthenticated