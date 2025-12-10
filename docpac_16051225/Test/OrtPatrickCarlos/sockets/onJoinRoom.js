const instanceManager = require('../modules/instanceManager');

module.exports = function onJoinRoom(socket, io, { logger }) {
  socket.on('joinRoom', (roomName) => {
    const session = socket.request.session;
    const userId = session && session.user ? session.user.id : socket.id;
    instanceManager.addUserToRoom(roomName, userId);
    socket.join(roomName);
    io.to(roomName).emit('systemMessage', { message: `${session && session.user ? session.user.username : 'Guest'} joined ${roomName}` });
    logger.info(`User ${userId} joined room ${roomName}`);
  });
};
