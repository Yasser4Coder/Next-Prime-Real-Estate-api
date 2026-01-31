const { Sequelize } = require('sequelize')
const dotenv = require('dotenv')

dotenv.config()

// Use 127.0.0.1 instead of localhost to avoid IPv6 (::1) - fixes "Access denied ... @'::1'" on shared hosting
const dbHost = process.env.DB_HOST || 'localhost'
const host = dbHost === 'localhost' ? '127.0.0.1' : dbHost

const sequelize = new Sequelize(
  process.env.DB_NAME || 'nextprime_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host,
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
    dialectOptions: {
      connectTimeout: 10000,
    },
  }
)

module.exports = sequelize
