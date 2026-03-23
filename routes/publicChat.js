import express from 'express'
import { getPublicChatConfig, restoreOrCreateSessionController } from '../controllers/publicChatController.js'

const router = express.Router()

router.get('/public/chat-configs/:slug', getPublicChatConfig)
router.post('/public/chat-configs/:slug/session', restoreOrCreateSessionController)

export default router
