const socket = io();
let typingTimeout;

// Ces valeurs seront injectées dynamiquement uniquement si une discussion est sélectionnée
const conversationId = window.conversationId;
const username = window.currentUsername;

if (conversationId && username) {
    socket.emit('join-conversation', conversationId);

    function emitTypingEvent() {
        socket.emit("typing", username, conversationId);
    }

    socket.on('typing', (username) => {
        clearTimeout(typingTimeout);
        const typingStatus = document.getElementById("typingStatus");
        typingStatus.textContent = `${username} est en train d'écrire...`

        typingTimeout = setTimeout(() => {
            const typingStatus = document.getElementById("typingStatus");
            if (typingStatus) {
                typingStatus.textContent = "";
            }
        }, 3000);
    });

    const form = document.getElementById('messageForm');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const contentInput = document.getElementById('content');
        const content = contentInput.value.trim();

        if (content === "") return;

        socket.emit('new-message', {
            content: content,
            sender: username,
            conversationId: conversationId
        });

        addMessageToDOM(username, content, true);
        contentInput.value = "";
    });

    socket.on('stop-typing', (username) => {
        const typingStatus = document.getElementById("typingStatus");
        if (typingStatus.textContent.includes(username)) typingStatus.textContent = "";
    });

    socket.on('new-message', (messagedata) => {
        const sender = messagedata.sender;
        const content = messagedata.content;
        if (sender !== username) {
            addMessageToDOM(sender, content, false);
        }
    });

    function addMessageToDOM(sender, content, isOwnMessage) {
        const messagesContainer = document.getElementById('messageContainer');
        const newMessage = document.createElement('p');
        newMessage.style.color = isOwnMessage ? 'blue' : 'red';
        newMessage.innerHTML = `${sender} : <span style="color:black">${content}</span>`;
        messagesContainer.appendChild(newMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}
