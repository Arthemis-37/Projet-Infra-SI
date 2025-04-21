const router = require('express').Router();

router.get('/home', (req, res) => {
    if (!req.session.user) {
        return res.render('home', { username: null });
    }

    const { username, email } = req.session.user;
    res.render('home', { username: username })
});

module.exports = router;