const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversation: { type: String, required: true }, // conversationId
    sender: { 
        userId: { type: String, required: true }, 
        username: { type: String, required: true }
    },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
