let socket = io();
let form = document.getElementById('form');
let input = document.getElementById('input');
let messages = document.getElementById('messages');
let user = document.getElementById('user').innerText;

form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', { user: user, message: input.value });
        input.value = '';
    }
});

socket.on('chat message', function (msg) {
    let item = document.createElement('li');
    item.textContent = `${msg.user}: ${msg.message}`;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
}
);