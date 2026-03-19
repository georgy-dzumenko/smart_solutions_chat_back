import express from 'express'

import {
    getAllChatSessions,
    getChatSessionsByConfigId,
    getChatSessionReport,
    getChatSessionMessages,
} from '../controllers/chatSessionsController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/chat-sessions', authMiddleware, getAllChatSessions)
router.get('/chat-configs/:configId/sessions', authMiddleware, getChatSessionsByConfigId)
router.get('/chat-sessions/:sessionId/report', authMiddleware, getChatSessionReport)
router.get('/chat-sessions/:sessionId/messages', authMiddleware, getChatSessionMessages)

export default router
