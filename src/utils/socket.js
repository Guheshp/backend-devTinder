const socketio = require('socket.io');
const crypto = require('crypto');
const { Chat } = require('../model/chat');

const getRoomId = (u1, u2) =>
    crypto.createHash('sha256').update([u1, u2].sort().join('_')).digest('hex');

const onlineUsers = new Map(); // userId -> socket.id


const initializeSocket = (server) => {
    const io = socketio(server, {
        cors: {
            origin: 'http://localhost:5173',
            credentials: true
        }
    });

    io.on('connection', (socket) => {

        /* JOIN CHAT */
        socket.on('joinChat', ({ userId, targetUserId }) => {
            if (!userId || !targetUserId) return;
            const roomId = getRoomId(userId, targetUserId);
            socket.join(roomId);
        });

        /* SEND MESSAGE */
        socket.on('sendMessage', async ({ userId, targetUserId, text }) => {
            if (!text || !userId || !targetUserId) return

            const roomId = getRoomId(userId, targetUserId)

            const message = {
                senderId: userId,
                text,
                seen: false
            }

            let chat = await Chat.findOne({
                participants: { $all: [userId, targetUserId] }
            })

            if (!chat) {
                chat = new Chat({
                    participants: [userId, targetUserId],
                    messages: [message],
                    lastMessageAt: new Date()
                })
            } else {
                chat.messages.push(message)
                chat.lastMessageAt = new Date() // 🔥 UPDATE HERE
            }

            await chat.save()

            const savedMessage = chat.messages.at(-1)

            io.to(roomId).emit('receiveMessage', savedMessage)
        })


        /* MARK AS SEEN */
        socket.on('markSeen', async ({ userId, targetUserId }) => {
            const roomId = getRoomId(userId, targetUserId)

            const chat = await Chat.findOne({
                participants: { $all: [userId, targetUserId] }
            })

            if (!chat) return

            let updated = false

            chat.messages.forEach(msg => {
                if (
                    msg.senderId.toString() === targetUserId &&
                    msg.seen === false
                ) {
                    msg.seen = true
                    updated = true
                }
            })

            if (updated) {
                await chat.save()

                // 🔥 notify sender
                io.to(roomId).emit('messagesSeen')
            }
        })


        socket.on('userOnline', (userId) => {
            onlineUsers.set(userId.toString(), socket.id);
            io.emit('userStatus', { userId, online: true });
        });

        socket.on('disconnect', () => {
            for (const [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    io.emit('userStatus', { userId, online: false });
                    break;
                }
            }
        });



    });
};

module.exports = { initializeSocket };
