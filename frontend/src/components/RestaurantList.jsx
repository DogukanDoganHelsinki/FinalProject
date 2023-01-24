import React, { useState, useEffect } from 'react'
import restaurantService from '../services/restaurants.js'
import favoriteService from '../services/favorites.js'
import Search from './Search.jsx'
import ratingsService from '../services/ratings.js'
import Popup from './Popup.jsx'
import "./RestaurantList.scss"
export const HEART_UNICODE = '\u{1F497}'



function Rating({ value }) {
  const ratingStr = typeof (value) === 'number' ? value : "Not rated"
  return (
    <div>{ratingStr}</div>
  )
}

function RestaurantList({ userId, token }) {
  const [allRestaurants, setAllRestaurants] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [favorites, setFavorites] = useState([])
  const [currentLat, setCurrentLat] = useState(null)
  const [currentLon, setCurrentLon] = useState(null)
  const [error, setError] = useState(null)
  const [ratings, setRatings] = useState([])
  const [activeRestaurant, setActiveRestaurant] = useState()
  const [sortOption, setSortOption] = useState('By Distance')

  const fetchRestaurants = async () => {
    const restaurantsFetched = await restaurantService.getAllRestaurants()
    //const restaurantsFetched = (await restaurantService.getAllRestaurants()).slice(0, 10)
    setAllRestaurants(restaurantsFetched)
    setRestaurants(restaurantsFetched)
  }

  const fetchFavorites = async () => {
    const favoritesFetched = await favoriteService.getFavoritesFromUser(token, userId)
    setFavorites(favoritesFetched)
  }

  const fetchRatings = async () => {
    const ratings = await ratingsService.getAvgRatingsForRestaurants(token, restaurants)
    setRatings(ratings)
  }

  useEffect(() => {
    fetchRatings()
  }, [restaurants])

  const distance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c // distance in km
    return d
  }

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180)
  }

  useEffect(() => {
    fetchRestaurants()
    fetchFavorites()
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLat(position.coords.latitude)
        setCurrentLon(position.coords.longitude)
      },
      (error) => {
        if (error.code === 1) {
          setError(
            "You have denied access to your location. Please allow access to see restaurants near you."
          )
        } else {
          setError(error)
        }
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    )
  }, [])

  let content
  let lat3
  let lon3
  let distanceArray = []

  if (currentLat && currentLon) {
    for (let i = 0; i < restaurants.length; i++) {
      lat3 = restaurants[i].location.lat
      lon3 = restaurants[i].location.lon

      distanceArray = distanceArray.concat(
        distance(lat3, lon3, currentLat, currentLon)
      )
    }
  } else if (error) {
    content = <p>Error: {error.message}</p>
  } else {
    content = <p>Loading...</p>
  }

  const sortByDistance = () => {
    const sortedDistanceArray = [...distanceArray].map((value, i) => {
      return {
        restaurant: restaurants[i],
        distance: value
      }
    }).sort((a, b) => a.distance - b.distance)
    const sortedRestaurants = sortedDistanceArray.map(obj => obj.restaurant)

    setRestaurants(sortedRestaurants)
  }

  const handleFavoriteToggle = async (restaurantId) => {
    if (favorites.some(favorite => favorite.restaurant_id === restaurantId)) {
      const favoriteFound = favorites.find(favorite => favorite.restaurant_id === restaurantId)
      await favoriteService.deleteFavorite(token, favoriteFound.id)
    } else {
      await favoriteService.createFavorite(token, restaurantId)
    }
    await fetchFavorites()
  }

  function getImageSrc(restaurant) {
    const media = restaurant.description ? restaurant.description.images : restaurant.media
    const value = media[0]
    const src = value ?
      value.url ? value.url : value.largeUrl
      : '../src/images/restaurant.jpg'
    return src
  }

  function closePopup() {
    setActiveRestaurant(null)
  }

  const sortByName = () => {
    console.log("here")
    const sortedRestaurants = [...restaurants].sort((restaurant1, restaurant2) => {
      if (restaurant1.name.fi > restaurant2.name.fi) {
        return 1
      }
      if (restaurant1.name.fi < restaurant2.name.fi) {
        return -1
      }
      return 0
    })
    setRestaurants(sortedRestaurants)
  }

  const sortByRating = () => {
    const sortedRestaurants = restaurants
      .map(restaurant => ({ ...restaurant, ratingForApp: ratings.find(rating => rating.restaurantId === restaurant.id)?.rating || 0 }))
      .sort((restaurant1, restaurant2) => restaurant2.ratingForApp - restaurant1.ratingForApp)
    setRestaurants(sortedRestaurants)
  }

  const sortRestaurants = () => {
    if (sortOption === 'By Distance') {
      setSortOption('By Rating')
      sortByRating()
    }
    else if (sortOption === 'By Rating') {
      setSortOption('Alphabetically')
      sortByName()
    }
    else if (sortOption === 'Alphabetically') {
      setSortOption('By Distance')
      sortByDistance()
    }
  }

  return (
    <div className='mainRestaurantList'>
      <Search allRestaurants={allRestaurants} setRestaurants={setRestaurants} favorites={favorites} />
      {!error && (
        <div onClick={() => { sortRestaurants() }} className='sortBtn'><span>SORT</span>
          <ul className='sortOptions'>
            <li style={{ color: sortOption == 'By Distance' ? 'blue' : 'black' }}>By Distance</li>
            <li style={{ color: sortOption == 'By Rating' ? 'blue' : 'black' }}>By Rating</li>
            <li style={{ color: sortOption == 'Alphabetically' ? 'blue' : 'black' }}>Alphabetically</li>
          </ul>
        </div>
      )}
      {
        activeRestaurant && (
          <Popup restaurant={activeRestaurant} userId={userId} token={token} closePopup={closePopup} favorites={favorites} ratings={ratings} fetchRatings={fetchRatings}></Popup>
        )
      }
      {error && <div>{error}</div>}
      <div className="restaurant--div">
        {restaurants.map((restaurant, index) => {
          return (
            <div
              key={restaurant.id}
              className={favorites.map(fav => fav.restaurant_id).includes(restaurant.id) ? 'restaurant--component restaurant--component--favorite' : 'restaurant--component'
              }>
              {restaurant.description.images && (
                <img
                  onClick={() => { setActiveRestaurant(restaurant) }}
                  src={getImageSrc(restaurant)}
                  alt={restaurant.name.en}
                  height="100"
                  width="100"
                />
              )}
              <p className='restaurant--name' onClick={() => handleFavoriteToggle(restaurant.id)}>
                {restaurant.name.fi}{favorites.map(fav => fav.restaurant_id).includes(restaurant.id) && HEART_UNICODE}
              </p>              <Rating value={(() => {
                const rating = ratings.find(({ restaurantId }) => {
                  return restaurant.id == restaurantId
                })?.rating
                return rating
              })()}></Rating>
              {
                !error && distanceArray[index] && (
                  <p>{distanceArray[index].toFixed(2)}km</p>
                )
              }
            </div >
          )
        })}
      </div >
    </div >
  )
}

export default RestaurantList
