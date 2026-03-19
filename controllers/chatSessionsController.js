import {
    getAllChatSessionsByAdminId,
    getChatSessionsByConfigIdAndAdminId,
    getChatSessionReportBySessionIdAndAdminId,
    getChatSessionMessagesBySessionIdAndAdminId,
} from '../services/chatSessionsService.js'

export const getAllChatSessions = async (req, res) => {
    try {
        const adminId = req.user.userId

        const sessions = await getAllChatSessionsByAdminId(adminId)

        return res.status(200).json({
            sessions,
        })
    } catch (error) {
        console.error(error)

        return res.status(500).json({
            error: 'Internal server error',
        })
    }
}

export const getChatSessionsByConfigId = async (req, res) => {
    try {
        const adminId = req.user.userId
        const { configId } = req.params

        const sessions = await getChatSessionsByConfigIdAndAdminId({
            configId,
            adminId,
        })

        return res.status(200).json({
            sessions,
        })
    } catch (error) {
        console.error(error)

        return res.status(500).json({
            error: 'Internal server error',
        })
    }
}

export const getChatSessionReport = async (req, res) => {
    try {
        const adminId = req.user.userId
        const { sessionId } = req.params

        const report = await getChatSessionReportBySessionIdAndAdminId({
            sessionId,
            adminId,
        })

        if (!report) {
            return res.status(404).json({
                error: 'Report not found',
            })
        }

        return res.status(200).json({
            report,
        })
    } catch (error) {
        console.error(error)

        return res.status(500).json({
            error: 'Internal server error',
        })
    }
}

export const getChatSessionMessages = async (req, res) => {
    try {
        const adminId = req.user.userId
        const { sessionId } = req.params

        const messages = await getChatSessionMessagesBySessionIdAndAdminId({
            sessionId,
            adminId,
        })

        return res.status(200).json({
            messages,
        })
    } catch (error) {
        console.error(error)

        return res.status(500).json({
            error: 'Internal server error',
        })
    }
}
