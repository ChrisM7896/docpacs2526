const { error } = require('console')
const express = require('express')
const { json } = require('stream/consumers')
const path = require('path')
const fs = require('fs')
const { name } = require('ejs')

const app = express()

const port = 3000
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render ('index', { name: 'Guest' });
})

app.get ('/add', (req, res) => {
    res.render('add', { name: 'Guest' });
})

app.post('/add', (req, res) => {
    console.log(req.body)
    try {
        const name = req.body.name;
        const birthday = req.body.birthday;
        if (!name || !birthday) {
            return res.send('Please fill in all fields');
        }

        const filePath = path.join(__dirname, 'data.json');
        const fileContents = fs.readFileSync(filePath, 'utf-8');
        const dataObject = JSON.parse(fileContents);
        const newEntry = { name, birthday };
        dataObject.data.push(newEntry);

        fs.writeFileSync(filePath, JSON.stringify(dataObject, null, 4), 'utf-8');

        res.redirect('/');

    } catch (error) {
        console.error('Error processing form data:', error);
        res.status(500).send('An error occurred while processing your request.');
    }
})
app.get('/view', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'data.json');
        const fileContents = fs.readFileSync(filePath, 'utf-8');
        const dataObject = JSON.parse(fileContents);

        res.render('view', { data: dataObject.data, name: 'Guest' });
    } catch (error) {
        console.error('Error reading data.json:', error);
        res.status(500).send('An error occurred while loading the data.');
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000')
})