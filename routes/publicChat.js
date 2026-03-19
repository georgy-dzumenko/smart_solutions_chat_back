import express from 'express'
import { getPublicChatConfig, restoreOrCreateSessionController } from '../controllers/publicChatController.js'

const router = express.Router()

router.get('/public/chat-configs/:configId', getPublicChatConfig)
router.post('/public/chat-configs/:configId/session', restoreOrCreateSessionController)

export default router
