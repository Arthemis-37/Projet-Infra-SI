require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const authRoutes = require('./routes/auth');
const classicRoutes = require('./routes/classic');
const chatRoutes = require('./routes/chat');
const sessionSecret = process.env.SESSION_SECRET;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, '..', 'frontend', 'template'));
app.use('/static', express.static(path.join(__dirname, '..', 'frontend', 'static')));
app.use(session({
    name: 'session_id',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
    }
}));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-RequestedWith, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use('/', authRoutes, classicRoutes, chatRoutes);

module.exports = app;