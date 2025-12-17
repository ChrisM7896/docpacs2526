function onChat(io, socket) {
    //handle chat messages
    socket.on('chatMessage', ({ sender, message }) => {
        console.log(`Message from ${sender}: ${message}`);
        io.emit('chatMessage', { sender, message, timestamp: new Date() });
    });
};

module.exports = onChat;