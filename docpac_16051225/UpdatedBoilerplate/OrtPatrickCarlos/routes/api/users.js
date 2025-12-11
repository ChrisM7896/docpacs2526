const express = require('express');
const router = express.Router();
const isAuthenticated = require('../../middleware/isAuthenticated');
const logger = require('../../modules/logger');
const utilities = require('../shared/utilities');

// GET /api/users
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const users = await User.find({}, 'id username'); // Fetching only id and username
        res.json({ users });
    } catch (error) {
        logger.error('Error fetching users: ', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;