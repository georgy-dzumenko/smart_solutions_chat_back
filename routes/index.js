import express from 'express'

import authRouter from './auth.js'
import chatConfigsRouter from './chatConfigs.js'
import chatSessionsRouter from './chatSessions.js'
import publicChatRouter from './publicChat.js'

const router = express.Router()

router.use('/auth', authRouter)
router.use('/chat-configs', chatConfigsRouter)
router.use('/', chatSessionsRouter)
router.use('/', publicChatRouter)

export default router
