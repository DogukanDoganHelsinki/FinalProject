// import jwt from 'jsonwebtoken'
import server from './api/server.js'
import { createTables } from './db/db.js'
const PORT = process.env.PORT || 3001

createTables()

// FOR CLARITY (if needed)
// const { PG_HOST, PG_PORT, PG_USER, PG_PASSWORD, PG_DB, SECRET } = process.env
// const isProd = process.env.NODE_ENV === 'production'

// console.log("ARGS:", { pghost: PG_HOST, pgPort: PG_PORT, pgUser: PG_USER, pgPassword: PG_PASSWORD, PG_DB, isProd: isProd, secret: SECRET })

server.listen(PORT, () => {
    console.log('listening to ', PORT)
    // if you need a token for debugging/manual testing, uncomment next 3 lines (and add needed env variables):
    // if (process.env.NODE_ENV === 'development' && process.env.SECRET) {
    //     console.log('valid jwt token:', jwt.sign({ username: 'dev', id: 1 }, process.env.SECRET, { expiresIn: '2h' }))
    // }
})