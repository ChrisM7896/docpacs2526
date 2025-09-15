const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const fs =require('fs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/add', (req, res) => {
    res.render('add.ejs');
});

app.get('/view', (req, res) => {
    res.render('view.ejs');
});

app.get('/error', (req, res) => {
    res.render('error.ejs');
});

app.post('/add', (req, res) => {
    const { username, password } = req.body;
    console.log(username, password);

    if (username.trim() === '' || password.trim() === '') {
        return res.redirect('/error');
    }
    
    
    const filePath = path.join(__dirname, 'data.json');
    let jsonData = { data: []};
    if (fs.existsSync(filePath)) {
        const rawData = fs.readFileSync(filePath);
        jsonData = JSON.parse(rawData);
        console.log(jsonData);
        console.log(jsonData.data);
        
        

    }
    
    jsonData.data.push({ username, password });
    

    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

    res.redirect('/');
});

app.get('/view', (req, res) => {
    const filePath = path.join(__dirname, 'data.json');
    let jsonData = { data: []};

    if (fs.existsSync(filePath)) {
        const rawData = fs.readFileSync(filePath);
        jsonData = JSON.parse(rawData);
    }
    
    res.render('view.ejs', { users: jsonData.data });
});

app.use(express.static(__dirname));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});