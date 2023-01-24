import request from 'supertest'
import { jest } from '@jest/globals'

import server from '../src/api/server.js'
import { pool } from '../src/db/db.js'
import { createToken } from './test_helper.js'

const rootPath = '/api/favorites'

describe('FavoritesRouter', () => {

    const userForTesting = { username: 'testUser', id: 1}
    const validToken = createToken(userForTesting.username, userForTesting.id)
    let mockResponse = {}

    describe('GET /', () => {
        beforeAll(() => {
            mockResponse = {
                rows: [
                    { id: 1, user_id: 1, restaurant_id: '1111' },
                    { id: 2, user_id: 1, restaurant_id: '2222' },
                    { id: 3, user_id: 2, restaurant_id: '3333' },
                ]
            }

            pool.connect = jest.fn(() => ({
                query: () => mockResponse,
                release: () => null
            }))
        })
        it('without a token it returns an error text with the correct status code', async () => {
            const response = await request(server).get(rootPath)
            expect(response.status).toBe(401)
            expect(response.text).toBe('No token found')
        })
        it('with an invalid token it returns an error text with the correct status code', async () => {
            const response = await request(server)
                .get(rootPath)
                .set('Authorization', 'Bearer zzzzzzzzzzzzzz')
                .expect(401)

            expect(response.text).toBe('Token invalid')
        })
        it('with a valid token it returns 200 with a list of favorites', async () => {
            
            const response = await request(server)
                .get(rootPath)
                .set('Authorization', `Bearer ${validToken}`)
                .expect(200)

            expect(JSON.parse(response.text)).toStrictEqual(mockResponse.rows)
        })
    })

    describe('GET /user/:userId', () => {
        beforeAll(() => {
            mockResponse = {
                rows: [
                    { id: 1, user_id: 1, restaurant_id: '1111' },
                    { id: 2, user_id: 1, restaurant_id: '2222' },
                ]
            }

            pool.connect = jest.fn(() => ({
                query: () => mockResponse,
                release: () => null
            }))
        })
        it('when userId cannot be parsed into a number it returns an error text with the correct status code', async () => {
            const response = await request(server)
                .get(rootPath + '/user/kalkkuna')
                .set('Authorization', `Bearer ${validToken}`)
                .expect(400)

            expect(response.text).toBe('Could not parse user id')
        })
        it('with a valid token it returns 200 with a list of favorites', async () => {
            
            const response = await request(server)
                .get(rootPath + '/user/1')
                .set('Authorization', `Bearer ${validToken}`)
                .expect(200)

            expect(JSON.parse(response.text)).toStrictEqual(mockResponse.rows)
        })
    })
    
    describe('POST /', () => {
        it('when userId cannot be found in the decoded jwt payload it returns 400 with the correct error text', async () => {
            const favoriteToBeSent = { restaurantId: '1111' }
            const tokenWithNoId = createToken('strangeUser', null)

            const response = await request(server)
                .post(rootPath)
                .send(favoriteToBeSent)
                .set('Authorization', `Bearer ${tokenWithNoId}`)
                .expect(400)

            expect(response.text).toBe('Field(s) missing')
        })
        it('when userId found in the decoded jwt payload is an invalid type (string) it returns 400 with the correct error text', async () => {
            const favoriteToBeSent = { restaurantId: '1111' }
            const tokenWithStrangeIdType = createToken('anotherStrangeUser', '1')

            const response = await request(server)
                .post(rootPath)
                .send(favoriteToBeSent)
                .set('Authorization', `Bearer ${tokenWithStrangeIdType}`)
                .expect(400)

            expect(response.text).toBe('Field(s) incorrect type(s)')
        })
        it('when request body does not have a restaurantId property it returns 400 with the correct error text', async () => {
            const favoriteToBeSent = {}

            const response = await request(server)
                .post(rootPath)
                .send(favoriteToBeSent)
                .set('Authorization', `Bearer ${validToken}`)
                .expect(400)

            expect(response.text).toBe('Field(s) missing')
        })
        it('when request body has a restaurantId property with an invalid type (number) it returns 400 with the correct error code', async () => {
            const favoriteToBeSent = { restaurantId: 1111 }

            const response = await request(server)
                .post(rootPath)
                .send(favoriteToBeSent)
                .set('Authorization', `Bearer ${validToken}`)
                .expect(400)

            expect(response.text).toBe('Field(s) incorrect type(s)')
        })
        it('when a duplicate favorite already exists in the database it returns 400 with the correct error text', async () => {
            // mocked response is for the query checkIfDuplicateFavoriteAlreadyExists, which is executed first in the favoritesDao-createFavorite function
            mockResponse = {
                rows: [
                    { id: 1, user_id: 1, restaurant_id: '1111' }
                ]
            }

            pool.connect = jest.fn(() => ({
                query: () => mockResponse,
                release: () => null
            }))
            
            const favoriteToBeSent = { restaurantId: '1111' }

            const response = await request(server)
                .post(rootPath)
                .send(favoriteToBeSent)
                .set('Authorization', `Bearer ${validToken}`)
                .expect(400)

            expect(response.text).toBe('Could not create favorite')
        })

        it('returns 201 and the created favorite on success', async () => {
            // createFavorite does 2 db calls, so 2 mocked results are also needed
            const mockResponseForDuplicateCheck = { rows: [] }

            const mockResponseForCreatingFavorite = {
                rows: [
                    { id: 1, userId: 1, restaurantId: '5555' }
                ]
            }

            const mockedQueries = jest.fn()

            mockedQueries
                .mockReturnValueOnce(mockResponseForDuplicateCheck)
                .mockReturnValueOnce(mockResponseForCreatingFavorite)

            pool.connect = jest.fn(() => ({
                query: mockedQueries,
                release: () => null
            }))
            
            const favoriteToBeSent = { restaurantId: '5555' }

            const response = await request(server)
                .post(rootPath)
                .send(favoriteToBeSent)
                .set('Authorization', `Bearer ${validToken}`)
                .expect(201)

            expect(JSON.parse(response.text)).toStrictEqual(mockResponseForCreatingFavorite.rows[0])
        })
    })

    describe('DELETE /:favoriteId', () => {

        it('when favoriteId cannot be parsed into a number it returns an error text with the correct status code', async () => {
            const response = await request(server)
                .delete(rootPath + '/notANumber')
                .set('Authorization', `Bearer ${validToken}`)
                .expect(400)

            expect(response.text).toBe('Field(s) missing')
        })
        it('when userId cannot be found in the decoded jwt payload it returns 400 with the correct error text', async () => {
            const tokenWithNoId = createToken('strangeUser', null)

            const response = await request(server)
                .delete(rootPath + '/1')
                .set('Authorization', `Bearer ${tokenWithNoId}`)
                .expect(400)

            expect(response.text).toBe('Field(s) missing')
        })
        it('when userId found in the decoded jwt payload is an invalid type (string) it returns 400 with the correct error text', async () => {
            const tokenWithStrangeIdType = createToken('strangeUser', '0')

            const response = await request(server)
                .delete(rootPath + '/1')
                .set('Authorization', `Bearer ${tokenWithStrangeIdType}`)
                .expect(400)

            expect(response.text).toBe('Field(s) incorrect type(s)')
        })
        it('when user does not have favorite with the favoriteId in the database it returns 400 with the correct error text', async () => {
            // mocked response is for the query findAllFromUser, which is executed first in the favoritesDao-deleteFavorite function
            mockResponse = {
                rows: [
                    { id: 2, user_id: 1, restaurant_id: '2222' },
                    { id: 3, user_id: 1, restaurant_id: '3333' }
                ]
            }

            pool.connect = jest.fn(() => ({
                query: () => mockResponse,
                release: () => null
            }))
            

            const response = await request(server)
                .delete(rootPath + '/1')
                .set('Authorization', `Bearer ${validToken}`)
                .expect(400)

            expect(response.text).toBe('Could not delete favorite')
        })
        it('returns 200 and the deleted favorite on success', async () => {
            // deleteFavorite does 2 db calls, so 2 mocked results are also needed
            const mockResponseForFindAllFromUser = { 
                rows: [
                    { id: 1, userId: 1, restaurantId: '1111' },
                    { id: 2, userId: 1, restaurantId: '2222' }
                ] 
            }

            const mockResponseForCreatingFavorite = {
                rows: [
                    { id: 1, userId: 1, restaurantId: '1111' }
                ]
            }

            const mockedQueries = jest.fn()

            mockedQueries
                .mockReturnValueOnce(mockResponseForFindAllFromUser)
                .mockReturnValueOnce(mockResponseForCreatingFavorite)

            pool.connect = jest.fn(() => ({
                query: mockedQueries,
                release: () => null
            }))
            
            const response = await request(server)
                .delete(rootPath + '/1')
                .set('Authorization', `Bearer ${validToken}`)
                .expect(200)

            expect(JSON.parse(response.text)).toStrictEqual(mockResponseForCreatingFavorite.rows[0])
        })
    })
})