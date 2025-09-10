const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index.ejs', {

    });
});

app.get('/add', (req, res) => {
    res.render('add.ejs', {

    });
});

app.post('/add', (req, res) => {
    console.log(req.body);
    if (req.body.userName === '') {
        res.render('error.ejs', {

        });
    } else {
        const formData = {
            'userName': req.body.userName,
            'favColor': req.body.favColor
        };
        var data = fs.readFileSync('data.json', 'utf8');
        data = JSON.parse(data);
        console.log(data);
        data['data'].push(formData);
        var json = JSON.stringify(data);
        fs.writeFileSync('data.json', json);
        res.render('index.ejs', {

        });
    }
});

app.get('/view', (req, res) => {
    var data = fs.readFileSync('data.json', 'utf8');
    data = JSON.parse(data);

    console.log(data);
    res.render('view.ejs', {
        data: data.data
    });
});

app.listen(3000, () => {
    console.log('server started');
});