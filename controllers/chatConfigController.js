import pool from '../pg/pool.js'
import slugify from 'slugify'
import crypto from 'crypto'

const makeSlug = (title) => {
    const base = slugify(title, { lower: true, strict: true })
    const suffix = crypto.randomBytes(3).toString('hex')

    return `${base}-${suffix}`
}

export const createChatConfig = async (req, res) => {
    try {
        const adminId = req.user.userId

        const { title, topic, assistantRole, goal, rules, endConditions, farewellMessage, summaryInstructions } =
            req.body

        if (
            !title ||
            !topic ||
            !assistantRole ||
            !goal ||
            !rules ||
            !endConditions ||
            !farewellMessage ||
            !summaryInstructions
        ) {
            return res.status(400).json({
                error: 'All fields are required',
            })
        }

        const slug = makeSlug(title)

        const result = await pool.query(
            `
            INSERT INTO chat_configs (
                admin_id,
                title,
                slug,
                topic,
                assistant_role,
                goal,
                rules,
                end_conditions,
                farewell_message,
                summary_instructions
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            RETURNING *
            `,
            [
                adminId,
                title.trim(),
                slug,
                topic.trim(),
                assistantRole.trim(),
                goal.trim(),
                rules.trim(),
                endConditions.trim(),
                farewellMessage.trim(),
                summaryInstructions.trim(),
            ]
        )

        const config = result.rows[0]

        return res.status(201).json({
            config,
            publicUrl: `${process.env.CLIENT_URL}/chat/${config.slug}`,
        })
    } catch (error) {
        console.error(error)

        return res.status(500).json({
            error: 'Internal server error',
        })
    }
}

export const getChatConfigs = async (req, res) => {
    try {
        const adminId = req.user.userId

        const result = await pool.query(
            `
            SELECT
                id,
                admin_id,
                title,
                slug,
                is_active,
                topic,
                assistant_role,
                goal,
                rules,
                end_conditions,
                farewell_message,
                summary_instructions,
                created_at,
                updated_at
            FROM chat_configs
            WHERE admin_id = $1
            ORDER BY created_at DESC
            `,
            [adminId]
        )

        const configs = result.rows.map((config) => ({
            ...config,
            public_url: `${process.env.CLIENT_URL}/chat/${config.slug}`,
        }))

        return res.status(200).json({
            configs,
        })
    } catch (error) {
        console.error(error)

        return res.status(500).json({
            error: 'Internal server error',
        })
    }
}

export const getChatConfigById = async (req, res) => {
    try {
        const adminId = req.user.userId
        const { id } = req.params

        const result = await pool.query(
            `
            SELECT
                id,
                admin_id,
                title,
                slug,
                is_active,
                topic,
                assistant_role,
                goal,
                rules,
                end_conditions,
                farewell_message,
                summary_instructions,
                created_at,
                updated_at
            FROM chat_configs
            WHERE id = $1 AND admin_id = $2
            LIMIT 1
            `,
            [id, adminId]
        )

        const config = result.rows[0]

        if (!config) {
            return res.status(404).json({
                error: 'Chat config not found',
            })
        }

        return res.status(200).json({
            config: {
                ...config,
                public_url: `${process.env.CLIENT_URL}/chat/${config.slug}`,
            },
        })
    } catch (error) {
        console.error(error)

        return res.status(500).json({
            error: 'Internal server error',
        })
    }
}

export const updateChatConfig = async (req, res) => {
    try {
        const adminId = req.user.userId
        const { id } = req.params

        const {
            title,
            topic,
            assistantRole,
            goal,
            rules,
            endConditions,
            farewellMessage,
            summaryInstructions,
            isActive,
        } = req.body

        const existingResult = await pool.query(
            `
            SELECT *
            FROM chat_configs
            WHERE id = $1 AND admin_id = $2
            LIMIT 1
            `,
            [id, adminId]
        )

        const existingConfig = existingResult.rows[0]

        if (!existingConfig) {
            return res.status(404).json({
                error: 'Chat config not found',
            })
        }

        const nextTitle = title?.trim() ?? existingConfig.title
        const nextTopic = topic?.trim() ?? existingConfig.topic
        const nextAssistantRole = assistantRole?.trim() ?? existingConfig.assistant_role
        const nextGoal = goal?.trim() ?? existingConfig.goal
        const nextRules = rules?.trim() ?? existingConfig.rules
        const nextEndConditions = endConditions?.trim() ?? existingConfig.end_conditions
        const nextFarewellMessage = farewellMessage?.trim() ?? existingConfig.farewell_message
        const nextSummaryInstructions = summaryInstructions?.trim() ?? existingConfig.summary_instructions
        const nextIsActive = typeof isActive === 'boolean' ? isActive : existingConfig.is_active

        let nextSlug = existingConfig.slug

        if (title && title.trim() !== existingConfig.title) {
            nextSlug = makeSlug(nextTitle)
        }

        const result = await pool.query(
            `
            UPDATE chat_configs
            SET
                title = $1,
                slug = $2,
                topic = $3,
                assistant_role = $4,
                goal = $5,
                rules = $6,
                end_conditions = $7,
                farewell_message = $8,
                summary_instructions = $9,
                is_active = $10,
                updated_at = NOW()
            WHERE id = $11 AND admin_id = $12
            RETURNING *
            `,
            [
                nextTitle,
                nextSlug,
                nextTopic,
                nextAssistantRole,
                nextGoal,
                nextRules,
                nextEndConditions,
                nextFarewellMessage,
                nextSummaryInstructions,
                nextIsActive,
                id,
                adminId,
            ]
        )

        const updatedConfig = result.rows[0]

        return res.status(200).json({
            config: {
                ...updatedConfig,
                public_url: `${process.env.CLIENT_URL}/chat/${updatedConfig.slug}`,
            },
        })
    } catch (error) {
        console.error(error)

        return res.status(500).json({
            error: 'Internal server error',
        })
    }
}
