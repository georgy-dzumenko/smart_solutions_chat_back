import pool from '../pg/pool.js'

export const getAllChatSessionsByAdminId = async (adminId) => {
    const result = await pool.query(
        `
        SELECT
            cs.id AS session_id,
            cs.status,
            cs.started_at AS created_at,
            cs.ended_at,
            cs.config_id,
            cc.title AS config_title,
            sr.summary,
            sr.result
        FROM chat_sessions cs
        JOIN chat_configs cc
            ON cc.id = cs.config_id
        LEFT JOIN session_reports sr
            ON sr.session_id = cs.id
        WHERE cc.admin_id = $1
        ORDER BY cs.started_at DESC
        `,
        [adminId]
    )

    return result.rows
}

export const getChatSessionsByConfigIdAndAdminId = async ({ configId, adminId }) => {
    const result = await pool.query(
        `
        SELECT
            cs.id AS session_id,
            cs.status,
            cs.started_at AS created_at,
            cs.ended_at,
            cs.config_id,
            cc.title AS config_title,
            sr.summary,
            sr.result
        FROM chat_sessions cs
        JOIN chat_configs cc
            ON cc.id = cs.config_id
        LEFT JOIN session_reports sr
            ON sr.session_id = cs.id
        WHERE cs.config_id = $1
          AND cc.admin_id = $2
        ORDER BY cs.started_at DESC
        `,
        [configId, adminId]
    )

    return result.rows
}

export const getChatSessionReportBySessionIdAndAdminId = async ({ sessionId, adminId }) => {
    const result = await pool.query(
        `
        SELECT
            cs.id AS session_id,
            cs.status,
            cs.started_at,
            cs.ended_at,
            cs.config_id,
            cc.title AS config_title,
            cc.topic,
            sr.id AS report_id,
            sr.summary,
            sr.result,
            sr.client_profile,
            sr.recommendation,
            sr.created_at AS report_created_at
        FROM chat_sessions cs
        JOIN chat_configs cc
            ON cc.id = cs.config_id
        LEFT JOIN session_reports sr
            ON sr.session_id = cs.id
        WHERE cs.id = $1
          AND cc.admin_id = $2
        LIMIT 1
        `,
        [sessionId, adminId]
    )

    return result.rows[0] || null
}

export const getChatSessionMessagesBySessionIdAndAdminId = async ({ sessionId, adminId }) => {
    const result = await pool.query(
        `
        SELECT
            m.id,
            m.session_id,
            m.role,
            m.content,
            m.created_at
        FROM messages m
        JOIN chat_sessions cs
            ON cs.id = m.session_id
        JOIN chat_configs cc
            ON cc.id = cs.config_id
        WHERE m.session_id = $1
          AND cc.admin_id = $2
        ORDER BY m.created_at ASC
        `,
        [sessionId, adminId]
    )

    return result.rows
}
