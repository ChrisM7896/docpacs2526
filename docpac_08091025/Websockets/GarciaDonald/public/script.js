// Client-side Socket.IO script
// Connect automatically when the page loads 

// Wrap everything so it runs after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
	// if io is not available, the socket client script likely wasn't included
	if (typeof io === 'undefined') {
		console.error('Socket.IO client library not found. Be sure <script src="/socket.io/socket.io.js"></script> is included.');
		return;
	}

	// Create a connection but don't auto-connect so we can register listeners first
	const name = window.CURRENT_USER && window.CURRENT_USER.displayName;
	const socket = io({ autoConnect: false });

	// Handle incoming chat messages (register before connecting)
	const messagesEl = document.getElementById('messages');
	socket.on('chatMessage', (msg) => {
		const li = document.createElement('li');
		// msg expected to be { from, text }
		if (msg && typeof msg === 'object') {
			li.textContent = `${msg.from}: ${msg.text}`;
		} else {
			li.textContent = String(msg);
		}
		if (messagesEl) {
			messagesEl.appendChild(li);
			// scroll to bottom
			messagesEl.scrollTop = messagesEl.scrollHeight;
		}
	});

	// Update online users list (register before connecting)
	const usersListEl = document.getElementById('users-list');
	socket.on('userList', (usersArray) => {
		console.log('userList event received', usersArray);
		if (!usersListEl) return;
		usersListEl.innerHTML = '';
		usersArray.forEach((u) => {
			const li = document.createElement('li');
			li.textContent = u;
			usersListEl.appendChild(li);
		});
	});

	// Now register connect handler and connect
	socket.on('connect', () => {
		console.log('Connected to socket server, id=', socket.id);
		// Tell the server who this user is using the requested 'connection' event
		if (name) socket.emit('connection', name);
		else socket.emit('connection', 'Guest');
	});

	// start the connection after all handlers are registered
	socket.connect();

	// Send message when the form is submitted
	const form = document.getElementById('chat-form');
	const input = document.getElementById('message-input');
	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const text = input.value.trim();
		if (!text) return;

		// include displayName if available on the window
		const payload = (window.CURRENT_USER && window.CURRENT_USER.displayName)
			? { from: window.CURRENT_USER.displayName, text }
			: text;

		socket.emit('chatMessage', payload);
		input.value = '';
	});
});
