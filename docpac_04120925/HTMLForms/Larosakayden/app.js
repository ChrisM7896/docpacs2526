//setup
const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

//get endpoints
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/add', (req, res) => {
    res.render('add');
});

app.get('/views', (req, res) => {
    const fileData = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    res.render('views', { data: fileData.data });
});

//post endpoint
app.post('/add', (req, res) => {
    const { username, fgame } = req.body;
    //validates input
    if (!username || !fgame) {
        return res.status(400).send('Both username and favorite game are required.');
    }
    //reads to json file
    const data = fs.readFileSync('data.json', 'utf8');
    console.log('File content:', data);

    //parses json file
    let json = JSON.parse(data);
    console.log('Parsed JSON:', json.data);

    //adds new data to json file
    json.data.push({ username, fgame });
    fs.writeFileSync('data.json', JSON.stringify(json, null, 2));

    //ends post request
    // res.send(`Received submission: username - ${username}, fgame - ${fgame}`);
    res.redirect('/');
});


//listens
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});  

