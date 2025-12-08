function isAuthenticated(req, res, next, FORMBAR_AUTH_URL, REDIRECT_URL) {
    console.log(`Checking authentication for user: ${req.session.user}`);
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
            console.log(`Token expired for user: ${req.session.user}. Redirecting to refresh token.`);
            res.redirect(`${FORMBAR_AUTH_URL}/oauth?refreshToken=${tokenData.refreshToken}&redirectURL=${REDIRECT_URL}`);
        }
    } else {
        console.log('User not authenticated, redirecting to login');
        res.redirect(`/login?redirectURL=${REDIRECT_URL}`);
    }
};

module.exports = isAuthenticated;