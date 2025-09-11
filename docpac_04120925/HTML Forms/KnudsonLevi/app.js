const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.listen(3000, () => {console.log('Server is running on http://localhost:3000');});
app.get('/', (req, res) => {
    res.render('index');
});
app.get('/add', (req, res) => {
    res.render('add');
});
app.post('/add', express.urlencoded({ extended: true }), (req, res) => {
    const { username, password } = req.body;
    // Here you would typically save the data to a database
    console.log(`Received: Username - ${username} Password - ${password}`);
    if (err) {
        res.render('error', {error: err})
    }
    res.redirect('/');
});