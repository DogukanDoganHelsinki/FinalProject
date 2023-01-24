import { Router } from 'express'
import dao from '../db/ratingsDao.js'

const router = Router()

function checkFields(body, ...names){
    return names.every((name) => {
        return body[name] !== undefined
    })
}

function tryGetFields(descriptions, body){
    return descriptions.reduce((obj, {name, type, mandatory}) => {
        const value = body[name]

        if(mandatory && value === undefined){
            throw "Missing field"
        }
        switch(type){
            case("int"):
                const newValue = parseInt(value)
                if(newValue === NaN){
                    throw "Invalid value"
                }
                obj[name] = newValue
                break
            case("string"):
                obj[name] =  value.toString()
                break
            default:
                throw "invalid type"
        }
        return obj
    }, {})
}

router.get('/', async (_req, res) => {
    const ratings = await dao.findAll()
    res.send(ratings)
})

router.get('/user/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId)

    if (!userId) {
        return res.status(400).send('Could not parse user id')
    }
    const ratings = await dao.findAllFromUser(userId)
    res.send(ratings)
})

router.get('/restaurant/:restaurantId', async (req, res) => {
    const restaurantId = parseInt(req.params.restaurantId)

    if (!restaurantId) {
        return res.status(400).send('Could not parse user id')
    }
    const ratings = await dao.findAllFromRestaurant(restaurantId)
    res.send(ratings)
})

router.post('/', async (req, res) => {
    const user = req.user
    const fieldsMissingFromBody = !checkFields(req.body, "restaurantId", "rating")

    if (!user?.id || fieldsMissingFromBody) {
        return res.status(400).send('Field(s) missing')
    }

    try{
        if(typeof user?.id !== 'number'){
            throw "Incorrect user id"
        }
        const {restaurantId, rating} = tryGetFields(
            [
                {
                    name: "restaurantId",
                    type: "int",
                    mandatory: true
                },
                {
                    name: "rating",
                    type: "int",
                    mandatory: true
                }
            ],
            req.body
        )

        const ratingCreated = await dao.createRating(rating, user.id, restaurantId)
        if (!ratingCreated) {
            throw 'Could not create rating'
        }
        res.send(ratingCreated)
    }catch(error){
        return res.status(400).send(error.message)
    }
})

router.delete('/:ratingId', async (req, res) => {
    const user = req.user
    const ratingId = req.params.ratingId

    if (!user?.id || !ratingId) {
        return res.status(400).send('Field(s) missing')
    }

    if (typeof user?.id !== 'number' || typeof ratingId !== 'number') {
        return res.status(400).send('Field(s) incorrect type(s)')
    }

    const deleted = await dao.deleteRating(user.id, ratingId)
    if (deleted === null) {
        return res.status(400).send('Could not delete favorite')
    }

    res.send(deleted)
})

export default router