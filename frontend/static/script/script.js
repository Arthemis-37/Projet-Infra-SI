document.addEventListener("DOMContentLoaded", () => {
    console.log("Chargement des listeners pour les .chat-item");

    document.querySelectorAll(".chat-item").forEach(item => {
        item.addEventListener("click", () => {
            const convId = item.getAttribute("data-conv-id");
            const iframe = document.getElementById("convFrame");
            if (iframe) {
                iframe.src = `/api/conversation/${convId}`;
            }
        });
    });
});
