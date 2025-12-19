require('dotenv').config();
const express = require('express');
const multer = require('multer')
// const upload = multer({ dest: './data/uploads' })
const app = express();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);
const { io } = require('socket.io-client');
const isAuthenticated = require('./middleware/isAuthenticated').isAuthenticated;
const logIt = require('./modules/logger').logIt;
const fs = require('fs');
const { log } = require('console');
const routes = {
    home: require('./routes/home'),
    profile: require('./routes/profile'),
    // sockets: require('./routes/sockets')
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './data/uploads')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = file.originalname.split('.').pop();
        if (extension !== 'png' && extension !== 'jpg' && extension !== 'jpeg' && extension !== 'gif' && extension !== 'webp') {
            logIt((new Date()).toISOString(), `File upload failed: ${file.originalname}`, 'ERROR');
            return cb(new Error('Incorrect file type.'));
        }
        else if (file.fileSize > 500) {
            logIt((new Date()).toISOString(), `File upload failed (too large): ${file.originalname}`, 'ERROR');
            return cb(new Error('File too large.'));
        }
        else {
            cb(null, file.fieldname + '-' + uniqueSuffix + '.' + extension);
            fs.truncate('uploadedFiles.json', fs.statSync('uploadedFiles.json').size - 1, (err) => {
                if (err) {
                    logIt((new Date()).toISOString(), `Error truncating file: ${err.message}`, 'ERROR');
                }
                fs.appendFileSync('uploadedFiles.json', ',' + '{' + '"'+ 'Filename' + '"' + ': ' + '"' + file.fieldname + '-' + uniqueSuffix + '.' + extension + '",' + '"metadata": {' + '"Time": "' + (new Date()) + '",' + '"User": ' + '"' + req.session.user + '"' + '}' + '}' + ']')
            });
        }
    }
})

const upload = multer({ storage: storage })


const PORT = process.env.PORT || 3000;
const DATABSE_FILE = process.env.DATABASE_FILE || './data/database.sqlite';
const SECRET_KEY = process.env.SESSION_SECRET || 'your_secret_key';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:420/oauth';
const THIS_URL = process.env.THIS_URL || `http://localhost:${PORT}`;
const API_KEY = process.env.API_KEY || 'your_api_key'

const db = new sqlite3.Database(DATABSE_FILE, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

app.set('view engine', 'ejs');
app.use(express.static('public'));

//Put this in ./middleware/session.js
app.use(session({
    store: new SQLiteStore({ db: "sessions.db", dir: `./data` }),
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: false
}))


app.get('/', isAuthenticated, routes.home,);

app.get('/err', (req, res) => {
    res.render('error', { message: 'You shouldn\'t have done that.' });
})

app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.displayName;
        res.redirect('/');
        db.run('INSERT OR IGNORE INTO users (username) VALUES (?)', [tokenData.displayName], function (err) {
            if (err) {
                return console.error(err.message);
            }
            console.log(`User ${tokenData.displayName} saved to database.`);
        });
    } else { res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`) }

});

app.post('/login', express.urlencoded({ extended: true }), (req, res) => {
    try {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.displayName;
        logIt((new Date()).toISOString(), `User logged in: ${req.session.user}`, 'INFO');
        res.redirect('/');
        db.run('INSERT OR IGNORE INTO users (username) VALUES (?)', [tokenData.displayName], function (err) {
            if (err) {
                return console.error(err.message);
            }
            console.log(`User ${req.session.user} saved to database.`);
        });

    } catch (err) {
        console.error('Invalid token:', err.message);
        res.status(401).send('Invalid token');
    }
})

app.post('/', upload.single('avatar'), function (req, res, next) {
    console.log(req.file);
    logIt((new Date()).toISOString(), `File uploaded: ${req.file.filename}`, 'INFO');
})

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.get('/sockets', (req, res) => {
    res.render('sockets');
});

const socket = io(`${AUTH_URL}`, {
    extraHeaders: {
        api: API_KEY
    }
});

socket.on('connect', () => {
    console.log('SocketIO connected')
})

socket.on('ALARM'), () => {
    console.log('We have nothing to be afraid of but big scary monsters aaaahhhhhhh')
}


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    logIt((new Date()).toISOString(), `Server started on port ${PORT}`, 'INFO');

})


