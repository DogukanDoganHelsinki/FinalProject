import { executeQuery } from './db.js'
import * as queries from './queries.js'

const findAll = async () => {
    const dbResponse = await executeQuery(queries.findAllUsers)
    return dbResponse.rows
}

const findUserByUsername = async (username) => {
    const dbResponse = await executeQuery(queries.findUsername, [username])
    return dbResponse.rows[0]
}

const createUser = async (username, passwordHash) => {
    const dbResponse = await executeQuery(queries.createUser, [username, passwordHash])
    return dbResponse.rows[0]
}

export default {
    findAll,
    findUserByUsername,
    createUser
}