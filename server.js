import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { createServer } from 'http'
import { Server } from 'socket.io'

import apiRouter from './routes/index.js'
import { initSocket } from './socket/socket.js'

const app = express()

app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    })
)

app.use(express.json())
app.use(cookieParser())

app.use('/api', apiRouter)

const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true,
    },
})

initSocket(io)

httpServer.listen(3000, () => {
    console.log('Server running on :3000')
})
