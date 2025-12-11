const express = require('express');
const router = express.Router();
const logger = require('../modules/logger');
const isAuthenticated = require('../middleware/isAuthenticated');
const multer = require('multer');
const path = require('path');
const utilities = require('../shared/utilities');

router.get('/profile', isAuthenticated, (req, res) => {
    if (req.session && req.session.user) {
        logger.info(`User ${req.session.user.username} accessed their profile.`);
        res.render('profile', { user: req.session.user });
    } else {
        logger.info('Profile access attempt without a valid session.');
        res.redirect('/login'); // Redirect to login if no session
    }
});

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'data/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Filter for allowed file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/; // Add more types as needed
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        logger.info(`File type accepted: ${file.originalname}`);
        return cb(null, true);
    }
    logger.warn(`File type rejected: ${file.originalname}`);
    cb('Error: File type not allowed!');
};

// Initialize multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});

// File upload route
router.post('/upload', isAuthenticated, upload.single('file'), (req, res) => {
    if (req.file) {
        logger.info(`File uploaded: ${req.file.filename} by user ${req.session.user.username}`);
        // Optionally save metadata to the database here
        // Example: saveUploadMetadata(req.session.user.id, req.file.filename);

        res.send(`File uploaded successfully: ${req.file.filename}`);
    } else {
        logger.warn('No file uploaded.');
        res.status(400).send('No file uploaded.');
    }
});

module.exports = router;