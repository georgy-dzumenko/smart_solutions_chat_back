import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../pg/pool.js'
import { generateAccessToken, generateRefreshToken } from '../utils/tokens.js'

export const register = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: 'email and password required' })
        }

        const normalizedEmail = email.toLowerCase().trim()

        const hash = await bcrypt.hash(`${password}${process.env.SALT}`, 10)

        const result = await pool.query(
            `
      INSERT INTO users (email, password_hash)
      VALUES ($1,$2)
      RETURNING id,email
      `,
            [normalizedEmail, hash]
        )

        const user = result.rows[0]

        const payload = {
            userId: user.id,
            email: user.email,
        }

        const accessToken = generateAccessToken(payload)
        const refreshToken = generateRefreshToken(payload)

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        return res.json({
            user,
            accessToken,
        })
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({
                error: 'User already exists',
            })
        }

        console.error(error)

        res.status(500).json({
            error: 'server error',
        })
    }
}

export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body

        const normalizedEmail = email.toLowerCase().trim()

        const result = await pool.query(
            `
      SELECT id,email,password_hash
      FROM users
      WHERE email=$1
      `,
            [normalizedEmail]
        )

        const user = result.rows[0]

        if (!user) {
            return res.status(401).json({
                error: 'invalid credentials',
            })
        }

        const valid = await bcrypt.compare(`${password}${process.env.SALT}`, user.password_hash)

        if (!valid) {
            return res.status(401).json({
                error: 'invalid credentials',
            })
        }

        const payload = {
            userId: user.id,
            email: user.email,
        }

        const accessToken = generateAccessToken(payload)
        const refreshToken = generateRefreshToken(payload)

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        return res.json({
            user: {
                id: user.id,
                email: user.email,
            },
            accessToken,
        })
    } catch (error) {
        console.error(error)

        return res.status(500).json({
            error: 'server error',
        })
    }
}

export const refresh = (req, res) => {
    const token = req.cookies.refreshToken

    if (!token) {
        return res.status(401).json({
            error: 'No refresh token',
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)

        const payload = {
            userId: decoded.userId,
            email: decoded.email,
        }

        const newAccessToken = generateAccessToken(payload)

        return res.json({
            accessToken: newAccessToken,
        })
    } catch (error) {
        return res.status(401).json({
            error: 'Invalid refresh token',
        })
    }
}

export const logout = (req, res) => {
    res.clearCookie('refreshToken')

    return res.json({
        message: 'logged out',
    })
}
