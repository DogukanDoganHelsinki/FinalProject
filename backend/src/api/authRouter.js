import express from 'express'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { authenticate } from './middlewares.js'

import dao from '../db/authDao.js'

const router = express.Router()

router.get('/', authenticate, async (_req, res) => {
    // This can be removed later, for now, it's a get All users, (used for test purposes)

    const allUsers = await dao.findAll()
    console.log(allUsers)
    res.send(allUsers)
})

router.get('/checkTokenValidity', authenticate, (_req, res) => {
    res.sendStatus(200)
})

// TODO, not sure about the status codes, might be improved

router.post('/login', async (req, res) => {
    const { username, password } = req.body

    if (!Object.keys(req.body).length || !username || !password)
        return res.sendStatus(400)

    const targetUser = await dao.findUserByUsername(username)
    if (!targetUser)
        return res.status(400).send('Invalid username or password')

    const passwordMatch = await argon2.verify(targetUser.password_hash, password)

    if (!passwordMatch)
        return res.status(400).send('Invalid username or password')

    const userToken = createWebToken(username, targetUser.id)
    return res.status(200).send({ token: userToken, userId: targetUser.id })
})

router.post('/register', async (req, res) => {
    const { username, password } = req.body

    if (!Object.keys(req.body).length || !username || !password)
        return res.sendStatus(400)

    const targetUser = await dao.findUserByUsername(username)
    if (targetUser?.username === username)
        return res.status(400).send('Username taken')

    const hashResult = await argon2.hash(password)
    const createdUser = await dao.createUser(username, hashResult)

    const userToken = createWebToken(username, createdUser.id)
    console.log(userToken)
    return res.status(200).send({ token: userToken, userId: createdUser.id })
})

const createWebToken = (username, userId) => {
    const payload = { username: username, id: userId }
    const secret = process.env.SECRET
    const options = { expiresIn: '1h' }

    const token = jwt.sign(payload, secret, options)
    return token
}

export default router