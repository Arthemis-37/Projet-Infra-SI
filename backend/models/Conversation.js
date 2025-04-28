const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const convSchema = new mongoose.Schema({
    conversationId: { type: String, required: true, default: uuidv4 },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    updatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.models.Conversation || mongoose.model('Conversation', convSchema);