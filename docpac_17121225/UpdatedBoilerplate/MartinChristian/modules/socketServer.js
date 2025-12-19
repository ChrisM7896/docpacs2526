const io = require('socket.io');
const socketServer = io();

socketServer.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');

    });
});

module.exports = { socketServer };