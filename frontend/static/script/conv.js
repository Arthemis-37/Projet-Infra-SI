const socket = io();
let typingTimeout;

socket.emit('join-conversation', "<%= discussion.conversationId %>");

function emitTypingEvent() {
    const username = "<%= username %>";
    socket.emit("typing", username, "<%= discussion.conversationId %>");
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

    /** @type {HTMLInputElement} **/
    const contentInput = document.getElementById('content');
    const content = contentInput.value.trim();
    const sender = "<%= username %>";
    const conversationId = "<%= discussion.conversationId %>";

    if (content === "") return;

    socket.emit('new-message', {
        content: content,
        sender: sender,
        conversationId: conversationId
    })

    addMessageToDOM(sender, content, true);
    contentInput.value = "";
})

socket.on('stop-typing', (username) => {
    const typingStatus = document.getElementById("typingStatus");
    if (typingStatus.textContent.includes(username)) typingStatus.textContent = "";
})

socket.on('new-message', (messagedata) => {
    const sender = messagedata.sender;
    const content = messagedata.content;
    const conversationId = messagedata.conversationId;
    const chatContainer = document.querySelector(".conv-menu");
    const chatItem = document.querySelector(`.chat-item[data-conv-id="${conversationId}"]`);

    if (chatItem) {
        const lastMessage = chatItem.querySelector(".last-message");
        if (lastMessage) lastMessage.textContent = content;
    }

    chatContainer.prepend(chatItem);

    if (sender !== "<%= username %>") {
        addMessageToDOM(sender, content, false);
    }
})

function addMessageToDOM(sender, content, isOwnMessage) {
    const messagesContainer = document.getElementById('messageContainer');
    const newMessage = document.createElement('p');
    newMessage.style.color = isOwnMessage ? 'blue' : 'red';
    newMessage.innerHTML = `${sender} : <span style="color:black">${content}</span>`;
    messagesContainer.appendChild(newMessage);

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}