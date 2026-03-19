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

export const generateInitialAssistantMessage = async ({ config }) => {
    const systemPrompt = `
You are starting a new conversation with a client.

TOPIC:
${config.topic}

ASSISTANT ROLE:
${config.assistant_role}

GOAL:
${config.goal}

RULES:
${config.rules}

Generate the first message in the conversation.

Requirements:
- greet the client
- explain the context naturally
- keep it short
- encourage the client to reply

Return ONLY valid JSON:
{
  "reply": "string"
}
`

    const response = await openai.responses.create({
        model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
        input: [
            {
                role: 'system',
                content: systemPrompt,
            },
        ],
    })

    const parsed = safeJsonParse(response.output_text)

    if (!parsed?.reply) {
        throw new Error('Invalid initial assistant response format')
    }

    return {
        reply: parsed.reply,
    }
}

export const generateAiReply = async ({ config, history }) => {
    const systemPrompt = `
You are an AI assistant in a client chat.

Follow this configuration strictly:

TOPIC:
${config.topic}

ASSISTANT ROLE:
${config.assistant_role}

GOAL:
${config.goal}

RULES:
${config.rules}

END CONDITIONS:
${config.end_conditions}

FAREWELL MESSAGE:
${config.farewell_message}

Return ONLY valid JSON in this format:
{
  "reply": "string",
  "should_finish": false,
  "summary_hint": "short optional note"
}

Rules:
- "reply" must contain the message for the client
- "should_finish" must be boolean
- if conversation should end, use the configured farewell message or a close equivalent
- do not wrap JSON in markdown
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

    if (!parsed?.reply || typeof parsed?.should_finish !== 'boolean') {
        throw new Error('Invalid AI response format')
    }

    return {
        reply: parsed.reply,
        shouldFinish: parsed.should_finish,
        summaryHint: parsed.summary_hint || '',
    }
}
