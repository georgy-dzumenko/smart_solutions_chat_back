import {
    completeSession,
    createChatSession,
    getActiveConfigById,
    getSessionWithConfig,
    getSessionByIdAndConfigId,
    getActiveConfigBySlug,
} from './chatSessionService.js'
import { createMessage, getMessagesBySessionId } from './chatMessageService.js'
import { generateAiReply, generateInitialAssistantMessage } from './aiReplyService.js'
import { generateSessionSummary } from './aiSummaryService.js'
import { createSessionReport } from './chatReportService.js'

export const restoreOrCreateSession = async ({ slug, sessionId = null }) => {
    const config = await getActiveConfigBySlug(slug)

    if (!config) {
        throw new Error('Chat config not found or inactive')
    }

    let session = null
    let isNew = false

    if (sessionId) {
        session = await getSessionByIdAndConfigId({
            sessionId,
            configId: config.id,
        })
    }

    if (!session) {
        session = await createChatSession(config.id)
        isNew = true
    }

    let messages = await getMessagesBySessionId(session.id)

    if (isNew && messages.length === 0) {
        const initial = await generateInitialAssistantMessage({ config })

        const assistantMessage = await createMessage({
            sessionId: session.id,
            role: 'assistant',
            content: initial.reply,
        })

        messages = [assistantMessage]
    }

    return {
        session,
        config,
        messages,
        isNew,
    }
}

export const startChatSession = async ({ configId }) => {
    const config = await getActiveConfigById(configId)

    if (!config) {
        throw new Error('Chat config not found or inactive')
    }

    console.log('CONFIG:::::', config)

    const session = await createChatSession(config.id)

    return {
        session,
        config,
    }
}

export const handleIncomingMessage = async ({ sessionId, text }) => {
    const sessionWithConfig = await getSessionWithConfig(sessionId)

    if (!sessionWithConfig) {
        throw new Error('Session not found')
    }

    if (sessionWithConfig.status !== 'active') {
        throw new Error('Session already completed')
    }

    const userMessage = await createMessage({
        sessionId,
        role: 'user',
        content: text,
    })

    const history = await getMessagesBySessionId(sessionId)

    const aiResult = await generateAiReply({
        config: sessionWithConfig,
        history,
    })

    const assistantMessage = await createMessage({
        sessionId,
        role: 'assistant',
        content: aiResult.reply,
    })

    let status = 'active'
    let report = null

    if (aiResult.shouldFinish) {
        await completeSession(sessionId)
        status = 'completed'

        const fullHistory = await getMessagesBySessionId(sessionId)

        const summary = await generateSessionSummary({
            config: sessionWithConfig,
            history: fullHistory,
        })

        report = await createSessionReport({
            sessionId,
            summary: summary.summary,
            result: summary.result,
            clientProfile: summary.client_profile,
            recommendation: summary.recommendation,
        })
    }

    return {
        userMessage,
        assistantMessage,
        status,
        report,
    }
}
