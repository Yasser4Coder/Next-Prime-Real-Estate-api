const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const routes = require('./routes')

dotenv.config()

const app = express()
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.json({ name: 'Next Prime Real Estate API', status: 'ok', health: '/health' })
})

app.use('/api', routes)

app.get('/health', (req, res) => {
  const dbConnected = app.get('dbConnected')
  res.json({ ok: true, db: dbConnected === true })
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Server error' })
})

module.exports = app
