
socket.on('connect', () => {
    console.log('Connected to Socket.io server');
})

socket.on('disconnect', () => {
    console.log('Disconnected from Socket.io server');
});