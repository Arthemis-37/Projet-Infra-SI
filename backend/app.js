const express = require("express");

const app = express();

app.get('/', (req, res) => {
    res.send("Coucoutations le monde");
});

module.exports = app;