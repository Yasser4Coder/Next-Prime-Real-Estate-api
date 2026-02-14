/**
 * Ensures properties.bedrooms and properties.bathrooms are VARCHAR(100)
 * so values like "Studio – 1 – 2 – 3" are stored correctly.
 * Run once if you see 0 bedrooms after saving text like "Studio – 1 – 2 – 3".
 *
 * Usage: node src/scripts/ensurePropertyStringColumns.js
 */
const sequelize = require('../config/database')

async function run() {
  try {
    await sequelize.authenticate()
    console.log('Database connected.')

    await sequelize.query(
      'ALTER TABLE `properties` MODIFY COLUMN `bedrooms` VARCHAR(100) NULL DEFAULT NULL COMMENT \'e.g. "3" or "Studio – 1 – 2 – 3"\''
    )
    console.log('bedrooms column set to VARCHAR(100).')

    await sequelize.query(
      'ALTER TABLE `properties` MODIFY COLUMN `bathrooms` VARCHAR(100) NULL DEFAULT NULL COMMENT \'e.g. "2" or "1 – 3 (حسب الوحدة)"\''
    )
    console.log('bathrooms column set to VARCHAR(100).')

    console.log('Done.')
    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message || err)
    process.exit(1)
  }
}

run()
