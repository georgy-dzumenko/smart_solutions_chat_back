import pool from '../pg/pool.js'

export const createMessage = async ({ sessionId, role, content }) => {
    const result = await pool.query(
        `
        INSERT INTO messages (session_id, role, content)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [sessionId, role, content]
    )

    return result.rows[0]
}

export const getMessagesBySessionId = async (sessionId) => {
    const result = await pool.query(
        `
        SELECT id, session_id, role, content, created_at
        FROM messages
        WHERE session_id = $1
        ORDER BY created_at ASC
        `,
        [sessionId]
    )

    return result.rows
}
