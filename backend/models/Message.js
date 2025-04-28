const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const messageSchema = new mongoose.Schema({
    discussion: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    messageId: { type: String, required: true, default: uuidv4 },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema);