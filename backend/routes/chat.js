const router = require('express').Router();
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Message = require('../models/Message');

// Changer la route POST de création discussion pour renvoyer le HTML de la conv nouvellement créée
router.post('/create-discussion', async (req, res) => {
    try {
        const { selectUser } = req.body;

        const user1 = await User.findOne({ userId: req.session.user.id });
        const user2 = await User.findOne({ userId: selectUser });

        // 🔍 Vérifie s’il existe déjà une conversation entre ces deux utilisateurs
        let conversation = await Conversation.findOne({
            participants: { $all: [user1._id, user2._id], $size: 2 }
        }).populate('participants', 'username');

        if (!conversation) {
            // ✅ Sinon, on la crée
            conversation = await Conversation.create({
                participants: [user1._id, user2._id],
            });

            // recharge pour peupler les noms
            conversation = await Conversation.findOne({ conversationId: conversation.conversationId })
                .populate('participants', 'username');
        }

        const messages = await Message.find({ conversation: conversation._id })
            .populate('sender', 'username');

        const username = req.session.user.username;

        req.app.render('conv', {
            discussion: conversation,
            messages,
            username,
            noConvSet: false
        }, (err, html) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Erreur lors du rendu de la discussion.");
            }
            res.send(html);
        });
    } catch (e) {
        console.error(e);
        res.status(500).send("Erreur lors de la création de la discussion.");
    }
});


// ➕ Route API qui renvoie le HTML d'une conversation pour l’injecter dans home.ejs
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
            res.send(html); // renvoie le HTML à injecter
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur interne");
    }
});

// Envoi d’un message via POST classique (non utilisé en fetch ici, mais utile pour fallback ou test)
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

// Route qui affiche la page par défaut quand aucune conversation n'est sélectionnée
router.get('/conversation', (req, res) => {
    res.render('noConv');
});


module.exports = router;