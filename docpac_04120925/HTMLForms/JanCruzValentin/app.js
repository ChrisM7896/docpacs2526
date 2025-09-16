const express = require('express');
const fs = require('fs');
const app = express();
const bodyParser = require('body-parser');


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index')
});

app.get('/add', (req, res) => {
    res.render('add')
})

app.post('/add', (req, res) => {
    try{
        const data = JSON.parse(fs.readFileSync('./data.json')).data;
        const bDayStuff = {
            person: req.body.person,
            birthday: req.body.bday
        };
        
        console.log(bDayStuff.birthday);
        //Brand by default can never as it always has the first option from the drop down menu initially but for saftey
        if (bDayStuff.person === '') throw new Error('Name required');
        if (!bDayStuff.birthday) throw new Error('Birthday required');

        //pushing the information in orderData pulled from the info in add into ./data.json
        console.log(bDayStuff)
        data.push(bDayStuff);

        
        fs.writeFileSync('./data.json', JSON.stringify({data: data}));
        
        res.redirect('/');

    } catch (err) {
        res.send('error:'+ err.message );
    }

});

app.get('/view', (req, res) => {
    const data = JSON.parse(fs.readFileSync('./data.json')).data;

    //views the current array of data in orders
    res.render('view', { bdayList: data });
})



app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
