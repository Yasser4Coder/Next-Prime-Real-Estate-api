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
  const dotenv = require('dotenv')
  dotenv.config()

  const app = require('./src/app')
  const sequelize = require('./src/config/database')

  // Hostinger forces a specific port – must use process.env.PORT
  const PORT = process.env.PORT || 3000

  // Listen first so the process stays up even if DB fails (Hostinger 503 fix)
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`)
    app.set('dbConnecting', true)
    sequelize.authenticate()
      .then(() => {
        console.log('Database connected.')
        app.set('dbConnected', true)
        app.set('dbError', null)
        app.set('dbConnecting', false)
      })
      .catch((err) => {
        const msg = err.original?.message || err.parent?.message || err.message
        console.error('Database connection failed:', msg)
        app.set('dbConnected', false)
        app.set('dbError', String(msg))
        app.set('dbConnecting', false)
      })
  })
} catch (err) {
  writeStartupError(err)
  process.exit(1)
}
