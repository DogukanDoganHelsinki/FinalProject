import { Router } from 'express'
import dao from '../db/favoritesDao.js'

const router = Router()

router.get('/', async (_req, res) => {
    const allFavorites = await dao.findAll()
    res.send(allFavorites)
})

router.get('/user/:userId', async (req, res) => {
    const userId = Number(req.params.userId)

    if (!userId) {
        return res.status(400).send('Could not parse user id')
    }
    const allFavoritesFromUser = await dao.findAllFromUser(userId)
    res.send(allFavoritesFromUser)
})

router.post('/', async (req, res) => {
    const user = req.user
    const { restaurantId } = req.body

    if (!user?.id || !restaurantId) {
        return res.status(400).send('Field(s) missing')
    }

    if (typeof user?.id !== 'number' || typeof restaurantId !== 'string') {
        return res.status(400).send('Field(s) incorrect type(s)')
    }

    const favoriteCreated = await dao.createFavorite(user.id, restaurantId)
    if (!favoriteCreated) {
        return res.status(400).send('Could not create favorite')
    }

    res.status(201).send(favoriteCreated)
})

router.delete('/:favoriteId', async (req, res) => {
    const user = req.user

    const favoriteId = Number(req.params.favoriteId)

    if (!user?.id || !favoriteId) {
        return res.status(400).send('Field(s) missing')
    }

    if (typeof user?.id !== 'number' || typeof favoriteId !== 'number') {
        return res.status(400).send('Field(s) incorrect type(s)')
    }

    const favoriteDeleted = await dao.deleteFavorite(user.id, favoriteId)
    if (!favoriteDeleted) {
        return res.status(400).send('Could not delete favorite')
    }

    res.send(favoriteDeleted)
})

// router.get('/test', (req, res) => {
//     res.send('favorites test')
// })

export default router