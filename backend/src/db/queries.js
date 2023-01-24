
// export const createDatabase = 'CREATE DATABASE IF NOT EXISTS "loppuprojekti";'

export const createFavTable = `CREATE TABLE IF NOT EXISTS "favorites" (
    "id" SERIAL PRIMARY KEY, 
    "user_id" INT NOT NULL, 
    "restaurant_id" VARCHAR NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
    );`

export const createRatingTable = `
CREATE TABLE IF NOT EXISTS "ratings" (
    "id" VARCHAR UNIQUE NOT NULL PRIMARY KEY, 
    "rating" SMALLINT NOT NULL CHECK(rating < 6 AND rating > 0), 
    "user_id" INT NOT NULL, 
    "restaurant_id" VARCHAR NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
    );`

export const createUserTable = `CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL PRIMARY KEY, 
    "username" varchar NOT NULL, 
    "password_hash" varchar NOT NULL
    );`

// favorites
export const findAllFavorites = 'SELECT id, user_id, restaurant_id FROM favorites;'
export const findAllFavoritesFromUser = 'SELECT id, user_id, restaurant_id FROM favorites WHERE user_id = $1;'
export const createFavorite = 'INSERT INTO favorites (user_id, restaurant_id) VALUES ($1, $2) RETURNING id, user_id, restaurant_id;'
export const checkIfDuplicateFavoriteAlreadyExists = 'SELECT id FROM favorites WHERE user_id = $1 AND restaurant_id = $2;'
export const deleteFavorite = 'DELETE FROM favorites WHERE id = $1 RETURNING id;'

// auth
export const findAllUsers = 'SELECT * FROM users;'
export const findUsername = 'SELECT * FROM users WHERE username = $1;'
export const createUser = 'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, password_hash;'

//rarings
export const findAllRatings = `
    SELECT * FROM ratings;`
export const findAllRatingsFromUser = `
    SELECT * FROM ratings 
    WHERE user_id = $1;`
export const findAllRatingsFromRestaurant = `
    SELECT * FROM ratings 
    WHERE restaurant_id = $1;`
export const createRating = `
    INSERT INTO ratings (id, rating, user_id, restaurant_id) 
    VALUES ($1, $2, $3, $4) RETURNING id, rating, user_id, restaurant_id;`
export const deleteRating = `
    DELETE FROM ratings 
    WHERE id = $1 RETURNING id;`

