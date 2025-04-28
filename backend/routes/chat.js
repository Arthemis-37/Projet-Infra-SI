const router = require('express').Router();
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Message = require('../models/Message');

router.post('/create-discussion', async (req, res) => {
    try {
        const { selectUser } = req.body;

        const user1 = await User.findOne({ userId: req.session.user.id });
        const user2 = await User.findOne({ userId: selectUser });

        const conversation = await Conversation.create({
            participants: [user2._id, user1._id],
        })

        res.redirect(`/conversation/${conversation.conversationId}`);
    } catch (e) {
        console.error(e);
    }
})

router.get('/conversation/:conversationId', async (req, res) => {
    try {
        const discussion = await Conversation.findOne({ conversationId: req.params.conversationId })
            .populate('participants', 'username');
        const messages = await Message.find({ conversation: discussion._id })
            .populate('sender', 'username');

        res.render('conv', { discussion: discussion, messages: messages, username: req.session.user.username });
    } catch (e) {
        console.error(e);
    }
})

router.post('/send-message/:conversationId', async (req, res) => {
    try {
        const { content } = req.body;
        const conversationId = req.params.conversationId;

        const conversation = await Conversation.findOne({ conversationId: conversationId });
        if (!conversation) {
            return res.status(404).send('Conversation non trouvée');
        }

        const sender = await User.findOne({ userId: req.session.user.id });

        const message = await Message.create({
            conversation: conversation._id,
            sender: sender._id,
            content: content
        })

        conversation.lastMessage = message._id;
        await conversation.save();
        res.redirect(`/conversation/${conversationId}`);
    } catch (e) {
        console.error(e);
    }
})

module.exports = router;