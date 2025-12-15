const isAuthenticated = require('../middleware/isAuthenticated').isAuthenticated;

const homePage = (req, res) => {
    try {
        res.render('home', { user: req.session.user });
    } catch (error) {
        // res.status(500).send(error.message);
        console.error('Error rendering home page:', error.message);
    }
}

module.exports = homePage;