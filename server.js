const dotenv = require('dotenv')
dotenv.config()

const app = require('./src/app')
const sequelize = require('./src/config/database')

const PORT = parseInt(process.env.PORT, 10) || 5000

// Listen first so the process stays up even if DB fails (Hostinger 503 fix)
app.listen(PORT, '0.0.0.0', () => {
  console.log('Server listening on port ' + PORT)
  sequelize.authenticate()
    .then(() => {
      console.log('Database connected.')
      app.set('dbConnected', true)
    })
    .catch((err) => {
      console.error('Database connection failed:', err.message)
      app.set('dbConnected', false)
    })
})
