function onChat(io, socket) {
    //handle chat messages
    socket.on('chatMessage', (message) => {
        console.log('Message from ' + socket.id + ': ' + message);
        //broadcast message to all connected clients
        io.emit('chatMessage', { sender: socket.id, message: message});
    });
};

module.exports = onChat;