import jwt from 'jsonwebtoken'

export const authenticate = (req, res, next) => {
    const auth = req.get('Authorization')
    // no auth header or auth header with wrong formatting
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).send('No token found')
    }

    const token = auth.substring(7)
    // remember to assign a value to SECRET on your .env file
    const secret = process.env.SECRET 

    try {
        const decodedPayload = jwt.verify(token, secret)
        // use this in routes when you need to check the current user
        req.user = decodedPayload
        next()
    } catch (error) {
        return res.status(401).send('Token invalid')
    }
}