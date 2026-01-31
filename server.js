const fs = require('fs')
const path = require('path')

function writeStartupError(err) {
  const msg = (err && err.stack) || (err && err.message) || String(err)
  const file = path.join(__dirname, 'startup-error.log')
  try {
    fs.writeFileSync(file, new Date().toISOString() + '\n' + msg, 'utf8')
  } catch (e) {}
  console.error(msg)
}

try {
  require('dotenv').config()

  const app = require('./src/app')
  const sequelize = require('./src/config/database')

  // Hostinger sets process.env.PORT – fallback if missing (e.g. local dev)
  const PORT = parseInt(process.env.PORT, 10) || 3000
  if (!PORT || PORT < 1 || PORT > 65535) {
    throw new Error('Invalid PORT: ' + process.env.PORT)
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`)

    sequelize.authenticate()
      .then(() => {
        console.log('Database connected.')
      })
      .catch(err => {
        console.error('Database connection failed:', err.message)
      })
  })
} catch (err) {
  writeStartupError(err)
  process.exit(1)
}
