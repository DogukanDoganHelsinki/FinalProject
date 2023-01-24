import axios from 'axios'
import { createAuthorizationConfigFromToken } from './general.js'

const url = '/api/ratings'

// add token to header

// create a new rating
// POST /ratings

const createRating = async (rating, userId, restaurantId, token) => {
  const newRating = { rating, userId, restaurantId }
  try {
    const response = await axios.post(url, newRating, createAuthorizationConfigFromToken(token))
    return response.data
  } catch (error) {
    console.log('fetch failed,', error.response.data)
    return null
  }
}

// get all ratings
// GET /ratings
const getRatings = async (token) => {
  try {
    const response = await axios.get(url, createAuthorizationConfigFromToken(token))
    return response.data
  } catch (error) {
    console.log('fetch failed,', error.response.data)
    return null
  }
}

// get all ratings from specific user
const getRatingsFromUser = async (token, userId) => {
  try {
    const response = await axios.get(`${url}/user/${userId}`, createAuthorizationConfigFromToken(token))
    return response.data
  } catch (error) {
    console.log('fetch failed,', error.response.data)
    return null
  }
}

// GET /ratings/restaurant/restaurantId
const getAvgRatingsFromRestaurant = async (token, restaurantId) => {
  try {
    const response = await axios.get(`${url}/restaurant/${restaurantId}`, createAuthorizationConfigFromToken(token))
    const sum = response.data.reduce((sum, obj) => {
      return obj.rating + sum
    })
    const avg = sum / response.data.length
    return avg
  } catch (error) {
    console.log('fetch failed,', error.response.data)
    return null
  }
}

// const getAvgRatingsForRestaurants = async (token, restaurants) => {
//   try {
//     const ratings = await getRatings(token)
//     return restaurants.map((restaurant) => {
//       const matchingRatings = ratings.filter(rating => {
//         return rating.restaurant_id == restaurant.id
//       })

//       let ratingAvg
//       if(matchingRatings.length > 0){
//         const ratingSum = matchingRatings.reduce((sum, {rating}) => {
//           return sum + rating
//         }, 0)
//         ratingAvg = ratingSum / matchingRatings.length
//         matchingRatings.forEach(rating => {
//           ratings.splice(ratings.indexOf(rating), 1)
//         })
//       }

//       return {
//         restaurantId: restaurant.id,
//         rating: ratingAvg
//       }
//     })
//   } catch (error) {
//     console.log('fetch failed,', error.response.data)
//     return null
//   }
// }

const getAvgRatingsForRestaurants = async (token, restaurants) => {
  try {
    const ratings = await getRatings(token)
    const ratingsMap = new Map()
    ratings.forEach(({rating, restaurant_id: id}) => {
      if(ratingsMap.has(id)){
        const {count, ratingSum} = ratingsMap.get(id)
        ratingsMap.set(id, {
          count: count+1,
          ratingSum: ratingSum + rating
        })
      }else{
        ratingsMap.set(id, {
          count: 1,
          ratingSum: rating
        })
      }
    })
    return Array.from(ratingsMap.entries()).map(([k, v]) => {
      const {count, ratingSum} = v
      const avg = ratingSum / count
      return {
        restaurantId: k,
        rating: avg
      }
    })
  } catch (error) {
    console.log('fetch failed,', error.response.data)
    return null
  }
}

const deleteRating = async ratingId => {
  try {
    const response = await axios.delete(`${url}/${ratingId}`, createAuthorizationConfigFromToken(token))
    return response.data
  } catch (error) {
    console.log('fetch failed,', error.response.data)
    return null
  }
}

export default {
  createRating,
  getRatings,
  getAvgRatingsFromRestaurant,
  getAvgRatingsForRestaurants,
  deleteRating,
  getRatingsFromUser,
  
}