const express = require('express')
const logger = require('morgan')
const cors = require('cors')
require('dotenv').config()
const setJWTStrategy = require('./config/jwt')
const authMiddleware = require ('./middleware/jwt.js')

const contactsRouter = require('./routes/api/contacts')
const authRouter = require('./routes/api/authRouter')

const app = express()

const corsOptions = {
  origin:[`https://www.google.pl`]
}

app.use(logger('combined'))
app.use(cors(corsOptions))
app.use(express.json())

setJWTStrategy()

app.use('/api/contacts', authMiddleware, contactsRouter)
app.use('/api/users', authRouter)
 
app.use((req, res) => {
  res.status(404).json({ message: `Not found - ${req.path}` })
})

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message})
})

module.exports = app
