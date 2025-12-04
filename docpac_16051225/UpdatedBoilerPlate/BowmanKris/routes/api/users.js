function usersRoute(app, FORMBAR_API_KEY, FORMBAR_AUTH_URL) {
    app.get('/api/users', (req, res) => {
        try {
            fetch(`${FORMBAR_AUTH_URL}/api/me`, {
                method: 'GET',
                headers: {
                    'API': FORMBAR_API_KEY,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(data => {
                    res.json(data); // Send user data as JSON
                })
                .catch(error => {
                    res.status(500).json({ error: error.message }); // Handle fetch errors
                });
        } catch (error) {
            res.status(500).json({ error: error.message }); // Handle other errors
        }
    });
}

module.exports = usersRoute;