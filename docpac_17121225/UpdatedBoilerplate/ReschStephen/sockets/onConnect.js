// Handles initial connection behavior
import { logging } from '../modules/logger.js';
export default function onConnect(io) {
    io.on('connection', (socket) => {
        const userId = socket.request.session.user ? socket.request.session.user.username : 'Guest';
        logging.info(`User connected: ${userId} (Socket ID: ${socket.id})`);

        socket.on('disconnect', () => {
            logging.info(`User disconnected: ${userId} (Socket ID: ${socket.id})`);
        });
    });
}