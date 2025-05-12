const router = require('express').Router();
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const authMiddleware = require('../middlewares/auth');

// Route pour la page d'accueil
router.get('/', authMiddleware, async (req, res) => {
    try {
        const allUsers = await User.find();
        const userConvs = await Conversation.find({ participants: req.session.user._id })
            .populate('participants', 'username')
            .populate('lastMessage', 'content createdAt')
            .sort({ updatedAt: -1 });

        res.render('home', {
            user: { username: req.session.user.username, _id: req.session.user._id },
            allUsers: allUsers,
            userConvs: userConvs
        });
    } catch (e) {
        console.error(e);
    }
});

module.exports = router;
