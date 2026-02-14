const sequelize = require('../config/database')
require('../models')

async function sync() {
  try {
    await sequelize.authenticate()
    console.log('Database connected.')
    await sequelize.sync({ alter: true })
    console.log('Tables synced.')
    // Force bedrooms/bathrooms to VARCHAR so "Studio – 1 – 2 – 3" and "1 – 2 – 3" are stored as text, not converted to 0/1
    try {
      await sequelize.query(
        'ALTER TABLE `properties` MODIFY COLUMN `bedrooms` VARCHAR(100) NULL DEFAULT NULL'
      )
      console.log('bedrooms column set to VARCHAR(100).')
    } catch (e) {
      if (!/Duplicate column|Unknown column/i.test(e.message)) console.warn('bedrooms alter:', e.message)
    }
    try {
      await sequelize.query(
        'ALTER TABLE `properties` MODIFY COLUMN `bathrooms` VARCHAR(100) NULL DEFAULT NULL'
      )
      console.log('bathrooms column set to VARCHAR(100).')
    } catch (e) {
      if (!/Duplicate column|Unknown column/i.test(e.message)) console.warn('bathrooms alter:', e.message)
    }
    process.exit(0)
  } catch (err) {
    console.error('Sync failed:', err)
    process.exit(1)
  }
}

sync()
