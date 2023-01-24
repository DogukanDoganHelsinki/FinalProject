import { executeQuery } from './db.js'
import * as queries from './queries.js'

const findAll = async () => {
    const dbResponse = await executeQuery(queries.findAllRatings)
    return dbResponse.rows
}

const findAllFromUser = async userId => {
    const dbResponse = await executeQuery(queries.findAllRatingsFromUser, [ userId ])
    return dbResponse.rows
}

const findAllFromRestaurant = async restaurantId => {
    const dbResponse = await executeQuery(queries.findAllRatingsFromRestaurant, [ restaurantId ])
    return dbResponse.rows
}

const createRating = async (rating, userId, restaurantId) => {
    const id = `${userId}-${restaurantId}`
    const dbResponse = await executeQuery(queries.createRating, [ id, rating, userId, restaurantId ])
    return dbResponse.rows[0]
}

const deleteRating = async (ratingId) => {
    const dbResponse = await executeQuery(queries.deleteRating, [ ratingId ])
    if(dbResponse.rows.length === 0 ){
        return null
    }
    return dbResponse.rows[0]
}

export default {
    findAll,
    findAllFromUser,
    findAllFromRestaurant,
    createRating,
    deleteRating,
}