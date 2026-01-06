const express = require('express')
const router = express.Router()
const { userAuth } = require('../middleware/authmiddleware')
const { Chat } = require('../model/chat')
const ConnectionRequestModel = require('../model/connectionRequest')




router.get('/chat/unread-count', userAuth, async (req, res) => {
    try {
        const userId = req.user._id

        const chats = await Chat.find({
            participants: userId,
            'messages.seen': false
        }).select('messages participants')

        let unreadCount = 0

        chats.forEach(chat => {
            chat.messages.forEach(msg => {
                if (
                    !msg.seen &&
                    msg.senderId.toString() !== userId.toString()
                ) {
                    unreadCount++
                }
            })
        })

        res.json({ success: true, data: unreadCount })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})


router.get('/chat/list', userAuth, async (req, res) => {
    try {
        const userId = req.user._id

        const chats = await Chat.find({
            participants: userId
        })
            .sort({ lastMessageAt: -1 })
            .populate('participants', 'firstName lastName photo')
            .lean()

        const result = chats.map(chat => {
            const otherUser = chat.participants.find(
                u => u._id.toString() !== userId.toString()
            )

            // ✅ COUNT UNREAD MESSAGES
            const unreadCount = chat.messages.filter(
                msg =>
                    msg.senderId.toString() !== userId.toString() &&
                    msg.seen === false
            ).length

            const lastMessage = chat.messages.at(-1)

            return {
                chatId: chat._id,
                user: otherUser,
                lastMessage: lastMessage?.text || '',
                lastMessageAt: chat.lastMessageAt,
                unreadCount // 🔥 ADD THIS
            }
        })

        res.json({
            success: true,
            data: result
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

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
            msg.senderId._id.toString() !== userId.toString() &&
            msg.seen === false
        ) {
            msg.seen = true
        }
    })
    await chat.save()

    res.json({ success: true, chat })
})

module.exports = router
