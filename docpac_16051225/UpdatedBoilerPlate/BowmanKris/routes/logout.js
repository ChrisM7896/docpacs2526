function logout(app) {
    app.get('/logout', (req, res) => {         
        if (req.session) {
            req.session.destroy(err => {
                if (err) {
                    console.error('Error destroying session:', err);
                } else {
                    console.log('Session destroyed successfully.');
                }
                res.render('login');
            });
        } else {
            res.render('login');
        }
    });
}

module.exports = logout;