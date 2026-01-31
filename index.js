import dotenv from 'dotenv'
import app from './src/app.js'
import sequelize from './src/config/database.js'

dotenv.config()

const PORT = parseInt(process.env.PORT, 10) || 5000

async function start() {
  try {
    await sequelize.authenticate()
    console.log('Database connected.')
  } catch (err) {
    console.error('Database connection failed:', err.message)
    process.exit(1)
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()
