import request from 'supertest'
import { jest } from '@jest/globals'

import server from '../src/api/server.js'
import { pool } from '../src/db/db.js'
import { createToken } from './test_helper.js'
import { response } from 'express'

describe('Authentication Router', () => {

    const userForTesting = { username: 'testUser', id: 1 }
    const validToken = createToken(userForTesting.username, userForTesting.id)
    let mockResponse = {}

    describe('POST /login', () => {

        beforeAll(() => {
            mockResponse = {
                rows: [
                    { id: 2, username: 'Robo', password_hash: '$argon2i$v=19$m=16,t=2,p=1$bG9wcHVwcm9qZWt0aQ$iNFUVKmF1q3YTXCTvjnFRQ' },
                ]
            }
            pool.connect = jest.fn(() => ({
                query: () => mockResponse,
                release: () => null
            }))
        })

        it('returns 400 without body containing username or/and password', async () => {
            const response = await request(server)
                .post('/api/auth/login')

            expect(response.status).toBe(400)
            expect(response.text).toBe('Bad Request')

        })

        it('returns 400 with username that does not exist', async () => {
            const response = await request(server)
                .post('/api/auth/login')
                .send({ username: 'Mobo', password: 'Bobo' })

            expect(response.status).toBe(400)
            expect(response.text).toBe('Invalid username or password')
        })

        it('returns 400 with correct username and incorrect password', async () => {
            const response = await request(server)
                .post('/api/auth/login')
                .send({ username: 'Robo', password: 'Cop' })

            expect(response.status).toBe(400)
            expect(response.text).toBe('Invalid username or password')
        })

        it('returns 200 with username and password that are correct', async () => {
            const response = await request(server)
                .post('/api/auth/login')
                .send({ username: 'Robo', password: 'Robo' })

            expect(response.status).toBe(200)
            expect(JSON.parse(response.text).userId).toBe(2)
        })
    })

    describe('POST /register', () => {

        beforeAll(() => {
            mockResponse = {
                rows: [{ id: 2, username: 'Robo', password_hash: '$argon2i$v=19$m=16,t=2,p=1$bG9wcHVwcm9qZWt0aQ$iNFUVKmF1q3YTXCTvjnFRQ' }]
            }
            pool.connect = jest.fn(() =>
            ({
                query: () => mockResponse,
                release: () => null
            }))
        })

        it('returns 400 without body containing username or/and password', async () => {
            const response = await request(server)
                .post('/api/auth/register')

            expect(response.status).toBe(400)
            expect(response.text).toBe("Bad Request")
        })

        it('returns 400 with username that has been taken', async () => {
            const response = await request(server)
                .post('/api/auth/register')
                .send({ username: 'Robo', password: 'Bobo' })

            expect(response.status).toBe(400)
            expect(response.text).toBe("Username taken")
        })

        it('returns 200 with username that is available', async () => {
            const response = await request(server)
                .post('/api/auth/register')
                .send({ username: 'Minty', password: 'Minty' })

            expect(response.status).toBe(200)
            expect(JSON.parse(response.text).userId).toBe(2)

        })
    })

    describe('GET /checkTokenValidity', () => {

        it('fail checkTokenValidity with no token', async () => {
            const response = await request(server).get('/api/auth/checkTokenValidity')
            expect(response.status).toBe(401)
            expect(response.text).toBe('No token found')
        })

        it('fail checkTokenValidity with invalid token', async () => {
            const response = await request(server).get('/api/auth/checkTokenValidity')
                .set('Authorization', 'Bearer zzzzzzzzzzzzzz')
            expect(response.status).toBe(401)
            expect(response.text).toBe('Token invalid')
        })

        it('pass checkTokenValidity with a valid token', async () => {

            const response = await request(server)
                .get('/api/auth/checkTokenValidity')
                .set('Authorization', `Bearer ${validToken}`)

            expect(response.status).toBe(200)
        })
    })
})