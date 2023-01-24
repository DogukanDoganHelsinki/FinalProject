import './Popup.css'
import ratingsService from '../services/ratings.js'
import { useState, useEffect } from 'react'
import { HEART_UNICODE } from './RestaurantList'

const Popup = ({ restaurant, userId, token, closePopup, favorites, ratings, fetchRatings }) => {
    const [rating, setRating] = useState(3)
    const [userRatings, setUserRatings] = useState([])

    const listItems = [
        // (r) => {
        //     return ["name", r.name.fi]
        // },
        (r) => {
            return ["address", r.location.address.street_address]
        },
        (r) => {
            return ["description", r.description.intro]
        },
        (r) => {
            return ["average rating", ratings.find(rating => rating.restaurantId === restaurant.id)?.rating || 'not rated']
        },
        (r) => {
            return ["your rating", userRatings.find(rating => rating.restaurant_id === restaurant.id)?.rating || 'not rated']
        }
    ].map((func) => {
        const [key, value] = func(restaurant)
        return (
            <li key={key}><b>{key}:</b> {value}</li>
        )
    })

    const fetchUserRatings = async () => {
        const userRatingsFetched = await ratingsService.getRatingsFromUser(token, userId)
        setUserRatings(userRatingsFetched)
    }

    useEffect(() => {
        fetchUserRatings()
    }, [])

    const handleRatingChange = event => {
        const ratingValue = event.target.value
        if (ratingValue > 5 || ratingValue < 1) {
            return
        }
        setRating(ratingValue)
    }

    const handleCreateRating = async () => {
        await ratingsService.createRating(rating, userId, restaurant.id, token)
        await fetchRatings()
        fetchUserRatings()
    }

    return (
        <div className="popup">
            <div className="popup-container">
                <h1>{restaurant.name.fi}{favorites.map(fav => fav.restaurant_id).includes(restaurant.id) && HEART_UNICODE}</h1>
                <ul>
                    {listItems}
                </ul>
                {/* <button onClick={() => console.log(restaurant.id, ratings, userRatings)}>debug</button> */}
                {
                !userRatings.map(rating => rating.restaurant_id).includes(restaurant.id) && (
                    <div className="popup-rating-container">
                        <input onChange={handleRatingChange} type="number" name="" id="" value={rating} placeholder="Restaurant rating" />
                        <button onClick={handleCreateRating}>rate</button>
                    </div>
                )}


                <button className="popup-button-close" onClick={() => closePopup()}>X</button>
            </div>
        </div>
    )
}

export default Popup