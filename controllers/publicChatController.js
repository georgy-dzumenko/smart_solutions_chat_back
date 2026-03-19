import { getActiveConfigById } from '../services/chatSessionService.js'

import { restoreOrCreateSession } from '../services/chatOrchestrator.js'

export const restoreOrCreateSessionController = async (req, res) => {
    try {
        const { configId } = req.params
        const { sessionId } = req.body || {}

        const result = await restoreOrCreateSession({
            configId,
            sessionId,
        })

        return res.json({
            session: {
                id: result.session.id,
                status: result.session.status,
            },
            messages: result.messages,
            isNew: result.isNew,
        })
    } catch (error) {
        console.error(error)

        return res.status(500).json({
            error: error.message || 'Failed to create session',
        })
    }
}

export const getPublicChatConfig = async (req, res) => {
    try {
        const { configId } = req.params

        const config = await getActiveConfigById(configId)

        if (!config) {
            return res.status(404).json({
                error: 'Chat config not found',
            })
        }

        return res.json({
            config: {
                id: config.id,
                title: config.title,
                topic: config.topic,
            },
        })
    } catch (error) {
        console.error(error)

        return res.status(500).json({
            error: 'Internal server error',
        })
    }
}
