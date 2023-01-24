import { executeQuery } from './db.js'
import * as queries from './queries.js'

const findAll = async () => {
    const dbResponse = await executeQuery(queries.findAllFavorites)
    return dbResponse.rows
}

const findAllFromUser = async userId => {
    const dbResponse = await executeQuery(queries.findAllFavoritesFromUser, [ userId ])
    return dbResponse.rows
}

const createFavorite = async (userId, restaurantId) => {
    const duplicatesInDb = await executeQuery(queries.checkIfDuplicateFavoriteAlreadyExists, [ userId, restaurantId ])
    // a favorite with this user and restaurant already exists
    if (duplicatesInDb.rows.length > 0) {
        return null
    }
    const dbResponse = await executeQuery(queries.createFavorite, [ userId, restaurantId ])
    return dbResponse.rows[0]
}

const deleteFavorite = async (userId, favoriteId) => {
    const favoritesFromThisUser = await findAllFromUser(userId)

    // user has no favorites -> there is no case where she should be able to delete any
    if (favoritesFromThisUser.length === 0) {
        return null
    }
    // user does not have a favorite with given favoriteId
    if (!favoritesFromThisUser.find(favorite => favorite.id === favoriteId)) {
        return null
    }

    const dbResponse = await executeQuery(queries.deleteFavorite, [ favoriteId ])
    return dbResponse.rows[0]
}

export default {
    findAll,
    findAllFromUser,
    createFavorite,
    deleteFavorite,
}