const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    conversationId: { type: String, required: true, unique: true },
    participants: [{ 
        userId: { type: String, required: true }, 
        username: { type: String, required: true },
        avatar: { type: String }
    }],
    lastMessage: { type: String },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Conversation', conversationSchema);
