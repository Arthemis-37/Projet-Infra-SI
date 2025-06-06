const socket = io();
let typingTimeout;

const username = window.currentUsername;
const conversationId = window.conversationId;

if (!username || !conversationId) {
    console.warn("username ou conversationId manquant");
}

// Rejoindre la conversation
socket.emit('join-conversation', conversationId);

// Typing event
window.emitTypingEvent = () => {
    socket.emit("typing", username, conversationId);
};

// Affichage du "X écrit..."
socket.on('typing', (usernameTyping) => {
    const typingStatus = document.getElementById("typingStatus");
    if (!typingStatus) return;

    clearTimeout(typingTimeout);
    typingStatus.textContent = `${usernameTyping} est en train d'écrire...`;

    typingTimeout = setTimeout(() => {
        typingStatus.textContent = "";
    }, 3000);
});

// Formulaire de message
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("messageForm");
    const contentInput = document.getElementById("content");

    if (!form || !contentInput) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const content = contentInput.value.trim();
        if (!content) return;

        socket.emit("new-message", {
            content,
            sender: username,
            conversationId
        });

        addMessageToDOM(username, content, true);
        contentInput.value = "";
    });
});

// Réception d’un nouveau message
socket.on("new-message", ({ sender, content, conversationId: msgConvId }) => {
    if (msgConvId !== conversationId || sender === username) return;
    addMessageToDOM(sender, content, false);
});

// DOM injection
function addMessageToDOM(sender, content, isOwnMessage) {
    const container = document.getElementById("messageContainer");
    if (!container) return;

    const span = document.createElement("span");
    span.className = isOwnMessage ? "sender" : "receiver";
    span.textContent = content;
    container.appendChild(span);
    container.scrollTop = container.scrollHeight;
}
