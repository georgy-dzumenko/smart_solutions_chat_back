import express from 'express'
import { signIn, register, refresh, logout } from '../controllers/authController.js'

const router = express.Router()

router.post('/sign-in', signIn)
router.post('/register', register)
router.post('/refresh', refresh)
router.post('/logout', logout)

export default router
