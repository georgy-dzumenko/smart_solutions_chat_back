import { startChatSession, handleIncomingMessage } from '../services/chatOrchestrator.js'

export const initChatSocket = (io) => {
    io.on('connection', (socket) => {
        socket.on('chat:join', async (payload) => {
            try {
                const { sessionId } = payload || {}

                if (!sessionId) {
                    socket.emit('chat:error', {
                        message: 'sessionId is required',
                    })
                    return
                }

                socket.data.sessionId = sessionId
                socket.join(sessionId)

                socket.emit('chat:joined', {
                    sessionId,
                })
            } catch (error) {
                socket.emit('chat:error', {
                    message: error.message || 'Failed to join chat',
                })
            }
        })

        socket.on('chat:message', async (payload) => {
            try {
                const { sessionId, text } = payload || {}

                if (!sessionId || !text?.trim()) {
                    socket.emit('chat:error', {
                        message: 'sessionId and text are required',
                    })
                    return
                }

                if (socket.data.sessionId !== sessionId) {
                    socket.emit('chat:error', {
                        message: 'Invalid session',
                    })
                    return
                }

                io.to(sessionId).emit('chat:assistant_thinking', {
                    sessionId,
                    value: true,
                })

                const result = await handleIncomingMessage({
                    sessionId,
                    text: text.trim(),
                })

                io.to(sessionId).emit('chat:message', {
                    sessionId,
                    message: result.userMessage,
                })

                io.to(sessionId).emit('chat:message', {
                    sessionId,
                    message: result.assistantMessage,
                })

                io.to(sessionId).emit('chat:assistant_thinking', {
                    sessionId,
                    value: false,
                })

                if (result.status === 'completed') {
                    io.to(sessionId).emit('chat:completed', {
                        sessionId,
                        status: 'completed',
                    })
                }
            } catch (error) {
                io.to(socket.data.sessionId).emit('chat:assistant_thinking', {
                    sessionId: socket.data.sessionId,
                    value: false,
                })

                socket.emit('chat:error', {
                    message: error.message || 'Failed to send message',
                })
            }
        })
    })
}
