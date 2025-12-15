const logIt = require('../modules/logger').logIt;
const { io } = require('socket.io-client');
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:420/oauth';
const API_KEY = process.env.API_KEY || 'your_api_key'

const socket = io(`${AUTH_URL}`, {
    extraHeaders: {
        api: API_KEY
    }
});


function isAuthenticated(req, res, next) {
    if (req.session.user) {
        logIt((new Date()).toISOString(), `Is authenticated worky`, 'INFO');
        socket.emit('ALARM')
        return next();

    }
    else {
        logIt((new Date()).toISOString(), `Is authenticated not worky`, 'WARN');
        res.redirect('/login');
    }
}

exports.isAuthenticated = isAuthenticated;