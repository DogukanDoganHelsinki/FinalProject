import pg from 'pg'
import { createFavTable, createRatingTable, createUserTable } from './queries.js'

const { PG_HOST, PG_PORT, PG_USER, PG_PASSWORD, PG_DB } = process.env
const isProd = process.env.NODE_ENV === 'production'

export const pool = new pg.Pool({
    host: PG_HOST,
    user: PG_USER,
    password: PG_PASSWORD,
    database: PG_DB,
    port: PG_PORT,
    ssl: isProd
})

async function executeQuery(query, params) {
    const client = await pool.connect()
    try {
        if (process.env.NODE_ENV === 'development') console.log('Executing query')
        const result = await client.query(query, params)
        if (process.env.NODE_ENV === 'development') console.log('Query executed succesfully.')
        return result
    } catch (error) {
        console.log(error.stack)
        error.name = 'dbError'
        throw error
    } finally {
        client.release()
    }
}

async function createTables() {
    await executeQuery(createUserTable)
    await executeQuery(createRatingTable)
    await executeQuery(createFavTable)
}

export { executeQuery, createTables }