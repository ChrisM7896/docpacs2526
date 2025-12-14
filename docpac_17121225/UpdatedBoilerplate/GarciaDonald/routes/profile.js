// configuring multer
const multer = require('multer');
const { route } = require('../server');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'data/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });
// the database for uploading files
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data/database.sqlite', (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

router.post('/upload', isAuthenticated, upload.single('document'), (req, res) => {
    //inserting meta into database
    const user_id = req.session.user.id;
    const file_name = req.file.filename;
    const original_name = req.file.originalname;
    const uploaded_at = Date.now();
    const query = `INSERT INTO uploads (user_id, file_name, uploaded_at) VALUES (?, ?, ?)`;
    db.run(query, [user_id, file_name, uploaded_at], function(err) {
        if (err) {
            return res.status(500).send('Database error');
        }
        res.status(200).json({
            message: 'File uploaded successfully',
            filename: file_name,
            uploaded_at: uploaded_at
        });
    });
});