require('dotenv').config();
const express = require('express');
const path = require('path');
const sessionMiddleware = require('./middleware/session');
const userLayout = require('./modules/userLayout');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(sessionMiddleware);
app.use(express.static(path.join(__dirname, 'public')));

// Mount routes from routes/ if present
const homeRouter = require('./routes/home');
const loginRouter = require('./routes/login');
const profileRouter = require('./routes/profile');
const apiUsers = require('./routes/api/users');
const socketsRouter = require('./routes/sockets');

app.use('/', homeRouter);
app.use('/', loginRouter);
app.use('/profile', profileRouter);
app.use('/sockets', socketsRouter);
app.use('/api/users', apiUsers);

module.exports = app;

// If executed directly, start the HTTP server and attach Socket.IO
if (require.main === module) {
	const http = require('http');
	const fs = require('fs');
	const logger = require('./modules/logger');
	const socketServer = require('./modules/socketServer');
	const PORT = process.env.PORT || 3000;

	// Ensure uploads directory exists
	const uploadsDir = path.resolve(__dirname, 'data', 'uploads');
	try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch (err) { /* ignore */ }

	const server = http.createServer(app);
	socketServer.attach(server, sessionMiddleware, logger);

	server.listen(PORT, () => {
		logger.info(`Server started on http://localhost:${PORT}`);
		console.log(`Server started on http://localhost:${PORT}`);
	});

	process.on('SIGINT', () => {
		logger.info('Shutting down server (SIGINT)');
		server.close(() => process.exit(0));
	});
}