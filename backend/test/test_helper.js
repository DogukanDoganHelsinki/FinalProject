import jwt from 'jsonwebtoken'
import { config } from 'dotenv'
config()

export const createToken = (username, id) => jwt.sign({ username, id }, process.env.SECRET, { expiresIn: 60 })