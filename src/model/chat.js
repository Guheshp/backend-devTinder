const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    seen: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const chatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    messages: [messageSchema],

    // 🔥 KEY FIELD (used for sorting)
    lastMessageAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

module.exports.Chat = mongoose.model('Chat', chatSchema)
