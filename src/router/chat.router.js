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
    try {
        const { targetUserId } = req.params;
        const userId = req.user._id;

        // 1. FIRST: Try to find an existing chat history
        // We need this variable to decide if a Standard user is allowed to "reply"
        let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] }
        }).populate('messages.senderId', 'firstName lastName photo');

        // 2. ACCESS CONTROL LOGIC
        if (!req.user.isPremium) {

            // Check if they are connected
            const isConnected = await ConnectionRequestModel.findOne({
                status: 'accepeted', // Matching your database typo
                $or: [
                    { fromUserId: userId, toUserId: targetUserId },
                    { fromUserId: targetUserId, toUserId: userId }
                ]
            });

            // 🛑 BLOCK CONDITION:
            // Block ONLY IF: Not Connected AND No existing chat history.
            // (This allows Standard users to reply if a Premium user started the chat)
            if (!isConnected && !chat) {
                return res.status(403).json({
                    success: false,
                    message: 'Chat allowed only for connections. Upgrade to Premium to chat with anyone!'
                });
            }
        }

        // 3. If no chat exists yet (Accessible only if Premium or Connected), create it
        if (!chat) {
            chat = new Chat({
                participants: [userId, targetUserId],
                messages: []
            });
            await chat.save();
        }

        // 4. Mark messages as seen
        let hasUnseen = false;
        chat.messages.forEach(msg => {
            // Mark as seen if the sender is the OTHER person and it is currently false
            if (msg.senderId && msg.senderId._id.toString() !== userId.toString() && !msg.seen) {
                msg.seen = true;
                hasUnseen = true;
            }
        });

        if (hasUnseen) {
            await chat.save();
        }

        res.json({ success: true, chat });

    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});


router.get('/chat/is-connected/:targetUserId', userAuth, async (req, res) => {
    try {
        const loggedInUserId = req.user._id
        const { targetUserId } = req.params


        const connection = await ConnectionRequestModel.findOne({
            $or: [
                {
                    fromUserId: loggedInUserId,
                    toUserId: targetUserId,
                    status: 'accepeted' // Note: Kept your spelling 'accepeted'
                },
                {
                    fromUserId: targetUserId,
                    toUserId: loggedInUserId,
                    status: 'accepeted'
                }
            ]
        })

        res.json({
            success: true,
            isConnected: !!connection
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})


// router.get('/chat/:targetUserId', userAuth, async (req, res) => {
//     try {
//         const { targetUserId } = req.params;
//         const userId = req.user._id;

//         // --- NEW LOGIC START ---
//         // If user is NOT premium, we strictly enforce the connection rule.
//         // If user IS premium, we skip this block and allow the chat to load.
//         if (!req.user.isPremium) {
//             const isConnected = await ConnectionRequestModel.findOne({
//                 status: 'accepeted', // Matching your database typo
//                 $or: [
//                     { fromUserId: userId, toUserId: targetUserId },
//                     { fromUserId: targetUserId, toUserId: userId }
//                 ]
//             });

//             if (!isConnected) {
//                 return res.status(403).json({
//                     success: false,
//                     message: 'Standard users can only chat with connections. Upgrade to Premium to chat with anyone!'
//                 });
//             }
//         }
//         // --- NEW LOGIC END ---

//         let chat = await Chat.findOne({
//             participants: { $all: [userId, targetUserId] }
//         }).populate('messages.senderId', 'firstName lastName photo'); // Added lastName/photo for better UI

//         if (!chat) {
//             // If no chat exists yet (e.g. Premium user messaging new person), create empty one
//             chat = new Chat({
//                 participants: [userId, targetUserId],
//                 messages: []
//             });
//             await chat.save();
//         }

//         // Mark messages as seen
//         // (Only mark messages sent BY the other person as seen)
//         let hasUnseen = false;
//         chat.messages.forEach(msg => {
//             if (msg.senderId && msg.senderId._id.toString() !== userId.toString() && !msg.seen) {
//                 msg.seen = true;
//                 hasUnseen = true;
//             }
//         });

//         if (hasUnseen) {
//             await chat.save();
//         }

//         res.json({ success: true, chat });

//     } catch (error) {
//         console.error("Chat Error:", error);
//         res.status(500).json({ success: false, message: error.message });
//     }
// });

module.exports = router
