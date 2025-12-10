
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

function attach(server, sessionMiddleware, logger) {
    const io = new Server(server);

    // Wrap express-style middleware for Socket.IO
    const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);
    io.use(wrap(sessionMiddleware));

    io.on('connection', (socket) => {
        try {
            const session = socket.request.session;
            const userLabel = session && session.user ? session.user.username : 'Guest';
            logger.info(`Socket connected: ${userLabel}`);

            // Dynamically load handlers from sockets/ folder
            const handlersDir = path.resolve(__dirname, '../sockets');
            if (fs.existsSync(handlersDir)) {
                const files = fs.readdirSync(handlersDir).filter(f => f.endsWith('.js'));
                files.forEach((file) => {
                    const handler = require(path.join(handlersDir, file));
                    if (typeof handler === 'function') {
                        handler(socket, io, { logger });
                    }
                });
            }

            socket.on('disconnect', (reason) => {
                logger.info(`Socket disconnected: ${userLabel} (${reason})`);
            });
        } catch (err) {
            logger.error('Socket connection error: ' + err.message);
        }
    });
}

module.exports = { attach };


