const express = require
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = 3000;
const rooms = new Set(['general', 'random']);
const usersInRooms = new Map();

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chat.ejs'));
});

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.username = 'Anonymous';
    socket.on('chat message', (msg) => {
        io.emit('chat message', {
            username: socket.username,
            message: msg
        });
    });
    socket.on('disconnect', () => {
        console.log('A user disconnected');
        Array.from(usersInRooms.entries()).forEach(([room, users]) => {
            if (users.has(socket.id)) {
                users.delete(socket.id);
                updateUserList(room);
            }
        });
    });
    socket.on('join room', (room) => {
        socket.rooms.forEach(r => {
            if (r !== socket.id) {
                socket.leave(r);
                socket.emit('left room', r);
            }
        });
        socket.join(room);
        socket.emit('joined room', room);
        if (!usersInRooms.has(room)) {
            usersInRooms.set(room, new Map());
        }
        usersInRooms.get(room).set(socket.id, {
            username: socket.username,
            id: socket.id
        });
        updateUserList(room);
    });
    socket.on('create room', (roomName) => {
        if (!rooms.has(roomName)) {
            rooms.add(roomName);
            io.emit('room created', roomName);
        }
    });
    socket.on('chat message', (data) => {
        const rooms = Array.from(socket.rooms).find(r => r !== socket.id) || 'general';
        io.to(room).emit('chat message', {
            username: socket.username,
            message: data.message,
            room: room
        });
    });
    function updateUserList(room) {
        const users = Array.from(usersInRooms.get(room)?.values() || []);
        io.to(room).emit('user list', {
            room: room,
            users: users.map(u => ({
                username: u.username,
            }))
        });
    }
});