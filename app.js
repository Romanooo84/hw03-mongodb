const express = require('express')
const logger = require('morgan')
const cors = require('cors')
require('dotenv').config()

const contactsRouter = require('./routes/api/contacts')

const app = express()

const corsOptions = {
  origin:[`https://www.google.pl`]
}

app.use(logger('combined'))
app.use(cors(corsOptions))
app.use(express.json())

app.use('/api/contacts', contactsRouter)
 
app.use((req, res) => {
  res.status(404).json({ message: `Not found - ${req.path}` })
})

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message})
})

module.exports = app
