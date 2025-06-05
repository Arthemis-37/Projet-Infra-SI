const router = require('express').Router();
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Message = require('../models/Message');

// ✅ Créer une nouvelle discussion
router.post('/create-discussion', async (req, res) => {
    try {
        const { selectUser } = req.body;
        const user1 = await User.findOne({ userId: req.session.user.id });
        const user2 = await User.findOne({ userId: selectUser });

        const conversation = await Conversation.create({
            participants: [user1._id, user2._id],
        });

        // 🔁 Redirection vers l'iframe conversation nouvellement créée
        res.redirect(`/conversation/${conversation.conversationId}`);
    } catch (e) {
        console.error(e);
        res.status(500).send("Erreur lors de la création de la discussion.");
    }
});

// ✅ Affichage vide si aucune conversation sélectionnée (chargé dans iframe)
router.get('/conversation', (req, res) => {
    res.render('conv', {
        noConvSet: true,
        discussion: null,
        messages: null,
        username: null
    });
});

// ✅ Affichage d'une conversation (chargé dans iframe ou navigation directe)
router.get('/conversation/:conversationId', async (req, res) => {
    try {
        const discussion = await Conversation.findOne({ conversationId: req.params.conversationId })
            .populate('participants', 'username');

        if (!discussion) {
            return res.status(404).send("Conversation non trouvée");
        }

        const messages = await Message.find({ conversation: discussion._id })
            .populate('sender', 'username');

        const username = req.session.user.username;

        res.render('conv', {
            discussion,
            messages,
            username,
            noConvSet: false
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur lors de l'affichage de la conversation");
    }
});

// ✅ Route API pour charger dynamiquement une conversation en AJAX
router.get('/api/conversation/:conversationId', async (req, res) => {
    try {
        const discussion = await Conversation.findOne({ conversationId: req.params.conversationId })
            .populate('participants', 'username');

        if (!discussion) {
            return res.status(404).send("Conversation non trouvée");
        }

        const messages = await Message.find({ conversation: discussion._id })
            .populate('sender', 'username');

        const username = req.session.user.username;

        req.app.render('conv', {
            discussion,
            messages,
            username,
            noConvSet: false
        }, (err, html) => {
            if (err) {
                console.error("Erreur de rendu conv.ejs :", err);
                return res.status(500).send("Erreur lors du rendu de la discussion.");
            }
            res.send(html);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur interne");
    }
});

// ✅ Envoi d’un message (POST classique - rarement utilisé avec socket.io)
router.post('/send-message/:conversationId', async (req, res) => {
    try {
        const { content } = req.body;
        const conversationId = req.params.conversationId;

        const conversation = await Conversation.findOne({ conversationId });
        if (!conversation) {
            return res.status(404).send('Conversation non trouvée');
        }

        const sender = await User.findOne({ userId: req.session.user.id });

        const message = await Message.create({
            conversation: conversation._id,
            sender: sender._id,
            content: content
        });

        conversation.lastMessage = message._id;
        await conversation.save();

        res.redirect(`/conversation/${conversationId}`);
    } catch (e) {
        console.error(e);
        res.status(500).send("Erreur lors de l'envoi du message.");
    }
});

// Création via API (fetch) pour affichage dynamique
router.post('/api/create-discussion', async (req, res) => {
    try {
        const currentUserId = req.session.userId;
        const otherUserId = req.body.selectUser;

        if (!otherUserId) {
            return res.status(400).send("Aucun utilisateur sélectionné.");
        }

        // Vérifie si une discussion existe déjà entre ces deux utilisateurs
        let discussion = await Discussion.findOne({
            participants: { $all: [currentUserId, otherUserId] }
        });

        if (!discussion) {
            // Crée une nouvelle discussion
            discussion = await Discussion.create({
                participants: [currentUserId, otherUserId]
            });
        }

        // Charge les messages (ou non) et renvoie le rendu ejs pour l’iframe
        const messages = await Message.find({ conversationId: discussion._id }).populate('sender');
        const participants = await User.find({ _id: { $in: discussion.participants } });

        res.render('conv', {
            username: req.session.username,
            discussion: {
                conversationId: discussion._id,
                participants,
            },
            messages,
            noConvSet: false,
        });
    } catch (error) {
        console.error("Erreur dans /api/create-discussion :", error);
        res.status(500).send("Erreur interne du serveur");
    }
});




module.exports = router;
