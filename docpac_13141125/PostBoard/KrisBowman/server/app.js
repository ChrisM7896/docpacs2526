import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import jwt from 'jsonwebtoken';
import session from 'express-session';

import auth from './auth.js';
import dbManager from './dbManager.js';

import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

auth(app, jwt, session);
const db = dbManager(sqlite3);

app.get('/', (_, res) => {
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

app.get('/api/job-posts', async (_, res) => {
    try {
        const jobPosts = await db.getJobPosts();
        res.json(jobPosts);
    } catch (error) {
        console.error('Error fetching job posts:', error);
        res.status(500).json({ error: 'Failed to fetch job posts' });
    }
});

app.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
});