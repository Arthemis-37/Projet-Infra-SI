const router = require('express').Router();
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const authMiddleware = require('../middlewares/auth');

router.get('/', authMiddleware, async (req, res) => {
    try {
        const allUsers = await User.find();
        const userConvs = await Conversation.find({ participants: { $in: req.session.user._id }})
            .populate('participants', 'username')
            .populate('lastMessage', 'content createdAt');

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