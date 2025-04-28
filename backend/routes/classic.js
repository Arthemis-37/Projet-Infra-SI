const router = require('express').Router();
const User = require('../models/User');
const authMiddleware = require('../middlewares/auth');

router.get('/', authMiddleware, async (req, res) => {
    try {
        const allUsers = await User.find();
        res.render('home', { username: req.session.user.username, allUsers: allUsers });
    } catch (e) {
        console.error(e);
    }
});

module.exports = router;