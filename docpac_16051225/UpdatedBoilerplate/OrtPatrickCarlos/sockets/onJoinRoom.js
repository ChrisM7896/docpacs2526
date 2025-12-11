const logger = require('../modules/logger');
const utilities = require('../shared/utilities');
const sessionMiddleware = require('../middleware/session');
const socketAuth = require('../middleware/socketAuth');
const instanceManager = require('../modules/instanceManager');
const socketio = require('socket.io');

function onJoinRoom(socket, roomId) {
    socketAuth(socket, (err) => {
        if (err) {
            logger.warn('Socket authentication failed on join room: ', err);
            socket.emit('error', 'Unauthorized');
            return;
        }

        const session = socket.request.session;
        const userId = session.user.id;

        // Check if the room exists
        const room = instanceManager.getRoomById(roomId);
        if (!room) {
            logger.warn(`User ${userId} attempted to join non-existent room: ${roomId}`);
            socket.emit('error', 'Room does not exist');
            return;
        }

        // Add user to the room
        socket.join(roomId, () => {
            logger.info(`User ${userId} joined room: ${roomId}`);
            socket.emit('joinedRoom', { roomId });
        });
    });
}

module.exports = onJoinRoom;