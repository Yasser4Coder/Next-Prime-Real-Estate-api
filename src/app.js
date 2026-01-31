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
  const dbConnecting = app.get('dbConnecting')
  const dbError = app.get('dbError')
  const out = { ok: true, db: dbConnected === true }
  if (dbConnected !== true) {
    if (dbConnecting) {
      out.error = 'Connecting... (try again in a few seconds)'
    } else {
      out.error = dbError || 'Connection failed (check server logs)'
    }
  }
  res.json(out)
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Server error' })
})

module.exports = app
