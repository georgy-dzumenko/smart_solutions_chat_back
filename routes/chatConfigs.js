import express from 'express'
import {
    createChatConfig,
    getChatConfigs,
    getChatConfigById,
    updateChatConfig,
} from '../controllers/chatConfigController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/', authMiddleware, createChatConfig)
router.get('/', authMiddleware, getChatConfigs)
router.get('/:id', authMiddleware, getChatConfigById)
router.patch('/:id', authMiddleware, updateChatConfig)

export default router
