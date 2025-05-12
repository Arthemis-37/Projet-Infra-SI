require('dotenv').config();

const mongoose = require("mongoose");
const app = require("./app");
const { Server } = require("socket.io");
const Message = require("./models/Message");
const User = require("./models/User");
const Conversation = require("./models/Conversation");

userDB = process.env.DB_USER;
passwordDB = process.env.DB_PASSWORD;
clusterDB = process.env.CLUSTER
port = process.env.PORT;

const expressServer = app.listen(port, () => {
    console.log(`Serveur lancé sur http://localhost:${port}/`)
});

const io = new Server(expressServer);

io.on('connection', (socket) => {
    socket.on('join-conversation', (conversationId) => {
        socket.join(conversationId);
    });

    socket.on('typing', (username, conversationId) => {
        console.log(username + " est en train d'écrire");
        socket.broadcast.to(conversationId).emit('typing', username);
    });

    socket.on('new-message', async (data) => {
        try {
            const { content, sender, conversationId } = data;

            socket.broadcast.to(conversationId).emit('stop-typing', sender);

            const user = await User.findOne({ username: sender });
            if (!user) {
                console.log(sender + " non trouvé");
                return;
            }

            const conversation = await Conversation.findOne({ conversationId: conversationId });
            if (!conversation) {
                console.log("Conversation non trouvée");
                return;
            }

            const message = await Message.create({
                conversation: conversation._id,
                sender: user._id,
                content: content
            })

            conversation.lastMessage = message._id;
            await conversation.save();

            io.to(conversationId).emit('new-message', {
                sender: user.username,
                content: content,
                conversationId: conversationId
            });
        } catch (error) {
            console.log(error);
        }
    });
})

mongoose.connect(`mongodb+srv://${userDB}:${passwordDB}@${clusterDB}/?retryWrites=true&w=majority&appName=Cluster0`)
    .then(() => console.log("Connexion à la base de données réussie !"))
    .catch(() => console.log("Connexion à la base de données échouée"));

