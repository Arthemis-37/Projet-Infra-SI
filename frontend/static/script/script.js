document.addEventListener("DOMContentLoaded", () => {
    // Ouvre une conversation existante dans l'iframe
    document.querySelectorAll(".chat-item").forEach(item => {
        item.addEventListener("click", () => {
            const convId = item.getAttribute('data-conv-id');
            const iframe = document.getElementById('convFrame');
            if (iframe) {
                iframe.src = `/api/conversation/${convId}`;
            }
        });
    });

    // Gestion de la création de discussion sans rechargement de page
    const newDiscussionForm = document.getElementById('newDiscussionForm'); // correction ici : id précis
    if (newDiscussionForm) {
        newDiscussionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const select = document.getElementById('selectUser');
            const userId = select.value;

            try {
                // Note : la route est "/create-discussion" et non "/api/create-discussion"
                const res = await fetch('/create-discussion', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ selectUser: userId })
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(errorText);
                }

                const html = await res.text();
                const iframe = document.getElementById('convFrame');
                if (iframe) {
                    // Injecte le HTML renvoyé dans l'iframe
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    iframeDoc.open();
                    iframeDoc.write(html);
                    iframeDoc.close();
                }
            } catch (err) {
                console.error("Erreur lors de la création de la discussion :", err);
            }
        });
    }
});
