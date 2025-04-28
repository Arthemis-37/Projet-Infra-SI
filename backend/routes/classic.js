const router = require('express').Router();

router.get('/home', (req, res) => {
    if (!req.session.user) {
        return res.render('home', { username: null });
    }

    res.render('home', { username: req.session.user.username });
});

module.exports = router;