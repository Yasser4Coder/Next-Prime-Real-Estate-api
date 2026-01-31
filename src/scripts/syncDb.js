import sequelize from '../config/database.js'
import '../models/index.js'

async function sync() {
  try {
    await sequelize.authenticate()
    console.log('Database connected.')
    await sequelize.sync({ alter: true })
    console.log('Tables synced.')
    process.exit(0)
  } catch (err) {
    console.error('Sync failed:', err)
    process.exit(1)
  }
}

sync()
