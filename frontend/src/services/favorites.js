import axios from 'axios'
import { createAuthorizationConfigFromToken } from './general.js'

const url = '/api/favorites'

// these are ONLY for manual testing
// import { createToken } from '../../../backend/test/test_helper.js'
// const url_for_manual_testing = 'http://localhost:3000/api/favorites'  // replace url in axios methods with this when testing methods manually
// process.env.SECRET = 'userYourLocalValueHere' // backend .env SECRET value, for createToken func
// const validToken = createToken('dev', 1)  // user from your local db

const createFavorite = async (token, restaurantId) => {
  const newFavorite = { restaurantId }
  try {
    const response = await axios.post(url, newFavorite, createAuthorizationConfigFromToken(token))
    return response.data
  } catch (error) {
    console.log('fetch failed,', error.response.data)
    return null
  }
}

const getFavorites = async token => {
  try {
    const response = await axios.get(url, createAuthorizationConfigFromToken(token))
    return response.data
  } catch (error) {
    console.log('fetch failed,', error.response.data)
    return null
  }
}

const getFavoritesFromUser = async (token, userId) => {
  try {
    const response = await axios.get(`${url}/user/${userId}`, createAuthorizationConfigFromToken(token))
    return response.data
  } catch (error) {
    console.log('fetch failed,', error.response.data)
    return null
  }
}

const deleteFavorite = async (token, favoriteId) => {
  try {
    const response = await axios.delete(`${url}/${favoriteId}`, createAuthorizationConfigFromToken(token))
    return response.data
  } catch (error) {
    console.log('fetch failed,', error.response.data)
    return null
  }
}

// manual testing
// getFavorites(validToken).then(data => console.log('getFavs', data))
// createFavorite(validToken, "4").then(res => console.log('createFav', res))
// getFavoritesFromUser(validToken, 1).then(data => console.log('getFavsFromUser', data))
// deleteFavorite(validToken, 3).then(res => console.log('deleteFav', res))

export default {
  createFavorite,
  getFavorites,
  getFavoritesFromUser,
  deleteFavorite
}