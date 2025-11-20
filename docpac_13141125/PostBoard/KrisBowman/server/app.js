const express = require('express');
const cors = require('cors');

const auth = require('./auth.js');
const dbManager = require('./dbManager.js');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

auth(app);

app.get('/', (req, res) => {
    res.send('Hello from the server! Use API routes to view json data.');
});

app.get('/api/user', (req, res) => {
    if (req.session.user) {
        res.json({
            authenticated: true,
            username: req.session.user
        });
    } else {
        res.json({
            authenticated: false
        });
    }
});

app.get('/api/job-posts', async (req, res) => {
    try {
        const jobPosts = await dbManager.getJobPosts();
        res.json(jobPosts);
    } catch (error) {
        console.error('Error fetching job posts:', error);
        res.status(500).json({ error: 'Failed to fetch job posts' });
    }
});

app.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
});