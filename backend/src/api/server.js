import express from 'express'
import axios from 'axios'
import cors from 'cors'
import { authenticate } from './middlewares.js'

import favoritesRouter from './favoritesRouter.js'
import ratingsRouter from './ratingsRouter.js'
import authenticationRoute from './authRouter.js'

const server = express()

server.use(cors())
server.use(express.json())
server.use('/', express.static('dist'))

server.get('/api', (req, res) => {
    res.send('Hello Team Blue')
})

// server.use('/', createProxyMiddleware({ target: 'https://open-api.myhelsinki.fi', changeOrigin: true }))

server.get('/api/restaurants', async (_req, res) => {
    const response = await axios.get('https://open-api.myhelsinki.fi/v1/places/?tags_search=Restaurant')
    res.send(response.data.data)
})

server.get('/api/restaurants/v2', async (_req, res) => {
    const response = await axios.get('https://open-api.myhelsinki.fi/v2/places/?tags_search=restaurants')
    res.json(response.data.data)
})

server.use('/api/favorites', authenticate, favoritesRouter)
server.use('/api/ratings', authenticate, ratingsRouter)
server.use('/api/auth', authenticationRoute)

export default server