require('dotenv').config();

const mongoose = require("mongoose");
const app = require("./app");
const { Server } = require("socket.io");

userDB = process.env.DB_USER;
passwordDB = process.env.DB_PASSWORD;
clusterDB = process.env.CLUSTER
port = process.env.PORT;

const expressServer = app.listen(port, () => {
    console.log(`Serveur lancé sur http://localhost:${port}/`)
});

const io = new Server(expressServer);

io.on('connection', (socket) => {
    socket.on('typing', (username) => {
        console.log(username + " est en train d'écrire");
        socket.emit('typing', username);
    });

    socket.on('new-message', (message) => {
        io.emit('new-message', message);
    });
})

mongoose.connect(`mongodb+srv://${userDB}:${passwordDB}@${clusterDB}/?retryWrites=true&w=majority&appName=Cluster0`)
    .then(() => console.log("Connexion à la base de données réussie !"))
    .catch(() => console.log("Connexion à la base de données échouée"));

