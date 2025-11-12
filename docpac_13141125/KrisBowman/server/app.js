const express = require('express');
const cors = require('cors');

const auth = require('./auth.js');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

auth(app);

app.get('/', (req, res) => {
    res.send('Hello from the server!');
});

app.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
});