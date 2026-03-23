import pool from '../pg/pool.js'

export const getSessionByIdAndConfigId = async ({ sessionId, configId }) => {
    const result = await pool.query(
        `
        SELECT *
        FROM chat_sessions
        WHERE id = $1 AND config_id = $2
        LIMIT 1
        `,
        [sessionId, configId]
    )

    return result.rows[0] || null
}

export const getActiveConfigById = async (configId) => {
    const result = await pool.query(
        `
        SELECT *
        FROM chat_configs
        WHERE id = $1 AND is_active = true
        LIMIT 1
        `,
        [configId]
    )

    return result.rows[0] || null
}

export const getActiveConfigBySlug = async (slug) => {
    const result = await pool.query(
        `
        SELECT *
        FROM chat_configs
        WHERE slug = $1 AND is_active = true
        LIMIT 1
        `,
        [slug]
    )

    return result.rows[0] || null
}

export const createChatSession = async (configId) => {
    const result = await pool.query(
        `
        INSERT INTO chat_sessions (status, config_id)
        VALUES ('active', $1)
        RETURNING *
        `,
        [configId]
    )

    return result.rows[0]
}

export const getSessionById = async (sessionId) => {
    const result = await pool.query(
        `
        SELECT *
        FROM chat_sessions
        WHERE id = $1
        LIMIT 1
        `,
        [sessionId]
    )

    return result.rows[0] || null
}

export const getSessionWithConfig = async (sessionId) => {
    const result = await pool.query(
        `
        SELECT
            cs.id AS session_id,
            cs.status,
            cs.started_at,
            cs.ended_at,
            cc.*
        FROM chat_sessions cs
        JOIN chat_configs cc ON cc.id = cs.config_id
        WHERE cs.id = $1
        LIMIT 1
        `,
        [sessionId]
    )

    return result.rows[0] || null
}

export const completeSession = async (sessionId) => {
    const result = await pool.query(
        `
        UPDATE chat_sessions
        SET status = 'completed',
            ended_at = NOW()
        WHERE id = $1
        RETURNING *
        `,
        [sessionId]
    )

    return result.rows[0]
}
