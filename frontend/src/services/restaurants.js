import axios from 'axios'
const url = '/api/restaurants/v2'

const getAllRestaurants = async () => {
  const response = await axios.get(url)
  return response.data
}

export default {
  getAllRestaurants
}