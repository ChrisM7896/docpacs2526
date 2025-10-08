// Client-side Socket.IO script
// Connect automatically when the page loads 

// Wrap everything so it runs after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
	// if io is not available, the socket client script likely wasn't included
	if (typeof io === 'undefined') {
		console.error('Socket.IO client library not found. Be sure <script src="/socket.io/socket.io.js"></script> is included.');
		return;
	}

	// Create a connection to the same origin
	const socket = io();

	socket.on('connect', () => {
		console.log('Connected to socket server, id=', socket.id);

		// Tell the server who this user is (if available)
		const name = window.CURRENT_USER && window.CURRENT_USER.displayName;
		if (name) {
			socket.emit('join', name);
		} else {
			// still emit a join so server can track anonymous users
			socket.emit('join', 'Guest');
		}
	});

	// Handle incoming chat messages
	const messagesEl = document.getElementById('messages');
	socket.on('chat message', (msg) => {
		const li = document.createElement('li');
		// msg expected to be { from, text }
		if (msg && typeof msg === 'object') {
			li.textContent = `${msg.from}: ${msg.text}`;
		} else {
			li.textContent = String(msg);
		}
		messagesEl.appendChild(li);
		// scroll to bottom
		messagesEl.scrollTop = messagesEl.scrollHeight;
	});

	// Update online users list
	const usersListEl = document.getElementById('users-list');
	socket.on('users', (usersArray) => {
		usersListEl.innerHTML = '';
		usersArray.forEach((u) => {
			const li = document.createElement('li');
			li.textContent = u;
			usersListEl.appendChild(li);
		});
	});

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

		socket.emit('chat message', payload);
		input.value = '';
	});
});
