const express = require('express')
const router = express.Router()
const { userAuth } = require('../middleware/authmiddleware')
const { Chat } = require('../model/chat')
const ConnectionRequestModel = require('../model/connectionRequest')

/* =====================================================
   CHAT LIST (STATIC — MUST BE FIRST)
===================================================== */
router.get('/chat/list', userAuth, async (req, res) => {
    try {
        const userId = req.user._id

        const chats = await Chat.find({
            participants: userId
        })
            .populate('participants', 'firstName lastName photo')
            .lean()

        const result = chats
            .map(chat => {
                const otherUser = chat.participants.find(
                    u => u._id.toString() !== userId.toString()
                )

                const lastMsg =
                    chat.messages?.length > 0
                        ? chat.messages[chat.messages.length - 1]
                        : null

                return {
                    chatId: chat._id,
                    user: otherUser,
                    lastMessage: lastMsg?.text || '',
                    lastMessageAt: lastMsg?.createdAt || chat.updatedAt
                }
            })
            .sort(
                (a, b) =>
                    new Date(b.lastMessageAt) -
                    new Date(a.lastMessageAt)
            )

        res.json({ success: true, data: result })
    } catch (error) {
        console.error('Chat list error:', error)
        res.status(500).json({ success: false, message: error.message })
    }
})

/* =====================================================
   CHAT BY USER ID (DYNAMIC — MUST BE LAST)
===================================================== */
router.get('/chat/:targetUserId', userAuth, async (req, res) => {
    const { targetUserId } = req.params
    const userId = req.user._id

    const isConnected = await ConnectionRequestModel.findOne({
        status: 'accepeted',
        $or: [
            { fromUserId: userId, toUserId: targetUserId },
            { fromUserId: targetUserId, toUserId: userId }
        ]
    })

    if (!isConnected) {
        return res.status(403).json({
            success: false,
            message: 'Chat allowed only for connections'
        })
    }

    let chat = await Chat.findOne({
        participants: { $all: [userId, targetUserId] }
    }).populate('messages.senderId', 'firstName')

    if (!chat) {
        chat = new Chat({
            participants: [userId, targetUserId],
            messages: []
        })
        await chat.save()
    }

    // mark seen
    chat.messages.forEach(msg => {
        if (
            msg.senderId._id.toString() !== userId.toString()
        ) {
            msg.seen = true
        }
    })
    await chat.save()

    res.json({ success: true, chat })
})

module.exports = router
