const fs = require('fs')
const path = require('path')

const LOG_FILE = path.join(__dirname, 'startup-error.log')
function log(msg) {
  const line = new Date().toISOString() + ' ' + (msg || '') + '\n'
  try { fs.appendFileSync(LOG_FILE, line, 'utf8') } catch (e) {}
  console.log(line.trim())
}
function logError(err) {
  const msg = (err && err.stack) || (err && err.message) || String(err)
  try { fs.appendFileSync(LOG_FILE, new Date().toISOString() + '\n' + msg + '\n', 'utf8') } catch (e) {}
  console.error(msg)
}

log('server.js started __dirname=' + __dirname + ' PORT=' + process.env.PORT)

try {
  require('dotenv').config()
  log('loading app...')
  const app = require('./src/app')
  log('loading database config...')
  const sequelize = require('./src/config/database')

  // Hostinger sets process.env.PORT – fallback if missing (e.g. local dev)
  const PORT = parseInt(process.env.PORT, 10) || 3000
  if (!PORT || PORT < 1 || PORT > 65535) {
    throw new Error('Invalid PORT: ' + process.env.PORT)
  }
  log('listening on port ' + PORT)

  const server = app.listen(PORT, '0.0.0.0', () => {
    log('Server running on port ' + PORT)
    app.set('dbConnecting', true)
    sequelize.authenticate()
      .then(() => {
        app.set('dbConnected', true)
        app.set('dbConnecting', false)
        app.set('dbError', null)
        log('Database connected.')
      })
      .catch(err => {
        const msg = err && err.message ? err.message : String(err)
        app.set('dbConnected', false)
        app.set('dbConnecting', false)
        app.set('dbError', msg)
        logError('Database connection failed: ' + msg)
      })
  })

  server.on('error', (err) => {
    logError('Listen error: ' + (err && err.message))
    process.exit(1)
  })
} catch (err) {
  logError(err)
  process.exit(1)
}
