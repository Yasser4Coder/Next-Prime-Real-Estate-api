const dotenv = require('dotenv')
dotenv.config()

const app = require('./src/app')
const sequelize = require('./src/config/database')

const PORT = parseInt(process.env.PORT, 10) || 5000

// Listen first so the process stays up even if DB fails (Hostinger 503 fix)
app.listen(PORT, '0.0.0.0', () => {
  console.log('Server listening on port ' + PORT)
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
