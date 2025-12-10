module.exports = function onChat(socket, io, { logger }) {
  socket.on('chatMessage', (data) => {
    // data: { room, message }
    const session = socket.request.session;
    const username = session && session.user ? session.user.username : 'Guest';
    const payload = { room: data.room, message: data.message, username, ts: Date.now() };
    io.to(data.room).emit('chatMessage', payload);
    logger.info(`Chat in ${data.room} by ${username}: ${data.message}`);
  });
};
