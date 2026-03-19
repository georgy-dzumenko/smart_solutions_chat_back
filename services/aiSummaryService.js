import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

const safeJsonParse = (value) => {
    try {
        return JSON.parse(value)
    } catch {
        return null
    }
}

export const generateSessionSummary = async ({ config, history }) => {
    const systemPrompt = `
You are generating an admin report after a finished AI-client chat.

TOPIC:
${config.topic}

SUMMARY INSTRUCTIONS:
${config.summary_instructions}

Return ONLY valid JSON in this format:
{
  "summary": "short summary",
  "result": "main outcome of the conversation",
  "client_profile": "communication style / engagement / behavior",
  "recommendation": "what admin should do next"
}

Do not wrap JSON in markdown.
`

    const transcript = history.map((message) => `${message.role.toUpperCase()}: ${message.content}`).join('\n')

    const response = await openai.responses.create({
        model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
        input: [
            {
                role: 'system',
                content: systemPrompt,
            },
            {
                role: 'user',
                content: `Conversation history:\n${transcript}`,
            },
        ],
    })

    const parsed = safeJsonParse(response.output_text)

    if (!parsed?.summary || !parsed?.result || !parsed?.client_profile || !parsed?.recommendation) {
        throw new Error('Invalid summary response format')
    }

    return parsed
}
