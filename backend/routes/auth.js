const router = require('express').Router();
const bcrypt = require('bcrypt');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

router.get('/create_account', (req, res) => {
    if (req.session.user) {
        return res.redirect('/home');
    }
    res.render('create_account', { message: null })
});

router.post('/create_account', async (req, res) => {
    const { username, email, password, checkpassword } = req.body;

    if (password !== checkpassword) {
        return res.render('create_account', { message: "Les mots de passe ne correspondent pas !", username, email });
    }

    try {
        const user = new User({ username, email, password });
        await user.save();
        req.session.user = {
            _id: user._id,
            id: user.userId,
            username: user.username,
            email: user.email
        }
        res.redirect('/');
    } catch (err) {
        res.render('create_account', { message: err.message });
    }
});

router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('login', { message: null });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', { message: "Email inexistante" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.render('login', { message: "Mot de passe incorrect", email: email });
        }

        req.session.user = {
            _id: user._id,
            id: user.userId,
            username: user.username,
            email: user.email
        };

        res.redirect('/');
    } catch (err) {
        res.render('login', { message: err.message });
    }
});

router.get('/reset_password', (req, res) => {
    if (req.session.user) {
        return res.redirect('/home');
    }
    res.render('reset_password', { message: null, color: null })
})

router.post('/reset_password', async (req, res) => {
    const email = req.body.email

    try {
        const user = await User.findOne({ email: email })
        if (!user) res.render('reset_password', { message: "Email non trouvée dans la base de données", color: "red" })
    } catch (e) {
        res.render('reset_password', { message: e.message, color: "red" })
    }
})

module.exports = router;