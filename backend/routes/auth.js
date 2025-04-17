const router = require('express').Router();
const User = require('../models/User');

router.get('/signup', (req, res) => {
    res.render('signup', { message: null })
});

router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const user = new User({ username, email, password });
        await user.save();
        res.render('success', { username })
    } catch (err) {
        res.render('signup', { message: err.message });
    }
});

module.exports = router;