import React, { useState, useEffect } from 'react'

import './Search.scss'

const SEARCH_LANGUAGE = 'fi'  // all restaurants have their name.fi property defined, unfortunately other languages do not
export const SELECTABLE_TAGS_IN_APP = [
  'Favorites',
  'Vegetarian',
  'Hamburger',
  'Indian',
  'Italian',
  'Japanese',
  'Nepalese',
  'Vietnamese',
  'Bistro',
  'Breakfast',
  'Brunch',
  'Chinese',
  'Street food',
  'Middle east',
  'Mexican',
  'French',
  'Sushi',
  'Thai',
  'Turkish',
  'Russian',
  'Bakery',
  'Fish',
  'Kebab',
  'Vegan',
  'Spanish',
  'Greek',
  'Korean',
  'Finnish',
  'Fast Food',
  'Lunch',
  'Fine Dining',
  'Asian'
]

function Search({ allRestaurants, setRestaurants, favorites }) {
  const [searchInput, setSearchInput] = useState('')
  const [selectedTags, setSelectedTags] = useState([])

  const filterRestaurants = (restaurantName) => {
    const restaurantTags = selectedTags.filter(tag => tag !== 'Favorites')
    const favoritesTagIsSelected = selectedTags.includes('Favorites')
    let filteredRestaurants = [...allRestaurants]

    // there is input in search field
    if (restaurantName) {
      filteredRestaurants = allRestaurants.filter(restaurant => restaurant.name[SEARCH_LANGUAGE].toLowerCase().includes(restaurantName.toLowerCase()))
    }
    // there is at least one restaurant tag (=tag in myHelsinki API) selected
    if (restaurantTags.length > 0) {
      filteredRestaurants = filteredRestaurants.filter(restaurant => restaurantTags
        .map(selectedTag => selectedTag.trim().toLowerCase())
        .every(selectedTagTrimmedLowerCase => restaurant.tags
          .map(restaurantTag => restaurantTag.name.toLowerCase())
          .includes(selectedTagTrimmedLowerCase)))
    }
    // favorite tag is selected
    if (favoritesTagIsSelected) {
      filteredRestaurants = filteredRestaurants.filter(restaurant => favorites.map(favorite => favorite.restaurant_id).includes(restaurant.id))
    }

    setRestaurants(filteredRestaurants)
  }

  useEffect(() => {
    filterRestaurants(searchInput)
  }, [searchInput, selectedTags])

  const handleSearchInputChange = event => {
    setSearchInput(event.target.value)
  }

  const restaurantTagIsSelected = tag => selectedTags.includes(tag)

  const handleTagClick = tag => restaurantTagIsSelected(tag)
    ? setSelectedTags(tags => tags.filter(tagInArray => tagInArray !== tag))
    : setSelectedTags(tags => tags.concat(tag))

  return (
    <div className='search-div'>
      <input
        className='search-input'
        type='text'
        placeholder='SEARCH'
        onChange={handleSearchInputChange}
        value={searchInput}
      />

      <div className='search-tags-div'>
        {SELECTABLE_TAGS_IN_APP.map((tag) => {
          return (
            <button
              className={restaurantTagIsSelected(tag) ? 'search-tag-button search-tag-button-toggled' : 'search-tag-button'}
              key={tag}
              onClick={() => handleTagClick(tag)}
            >
              <span>{tag}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Search