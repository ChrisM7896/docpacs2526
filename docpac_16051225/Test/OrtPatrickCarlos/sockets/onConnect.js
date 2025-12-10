module.exports = function onConnect(socket, io, { logger }) {
  socket.emit('welcome', { message: 'Welcome to the Socket.IO demo' });
};
