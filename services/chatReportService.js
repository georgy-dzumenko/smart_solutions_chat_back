import pool from '../pg/pool.js'

export const createSessionReport = async ({ sessionId, summary, result, clientProfile, recommendation }) => {
    const report = await pool.query(
        `
        INSERT INTO session_reports (
            session_id,
            summary,
            result,
            client_profile,
            recommendation
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [sessionId, summary, result, clientProfile, recommendation]
    )

    return report.rows[0]
}
