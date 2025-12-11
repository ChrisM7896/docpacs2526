const logger = require('../modules/logger');
const utilities = require('../shared/utilities');
const sessionMiddleware = require('../middleware/session');
const socketAuth = require('../middleware/socketAuth');
const instanceManager = require('../modules/instanceManager');

function onChat(socket, messageData) {
    socketAuth(socket, (err) => {
        if (err) {
            logger.warn('Socket authentication failed on chat: ', err);
            socket.emit('error', 'Unauthorized');
            return;
        }

        const session = socket.request.session;
        const userId = session.user.id;
        const roomId = messageData.roomId;
        const message = messageData.message;

        // Check if the room exists
        const room = instanceManager.getRoomById(roomId);
        if (!room) {
            logger.warn(`User ${userId} attempted to send message to non-existent room: ${roomId}`);
            socket.emit('error', 'Room does not exist');
            return;
        }

        // Broadcast the message to the room
        socket.to(roomId).emit('chatMessage', {
            userId,
            message,
            timestamp: utilities.getCurrentTimestamp()
        });

        logger.info(`User ${userId} sent message to room ${roomId}: ${message}`);
    });
}