const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Testimonial = sequelize.define(
  'Testimonial',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(255),
    },
    location: {
      type: DataTypes.STRING(255),
    },
    quote: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    rating: {
      type: DataTypes.TINYINT,
      defaultValue: 5,
    },
    initials: {
      type: DataTypes.STRING(10),
      comment: 'Derived from name (e.g. SA for Sarah Al)',
    },
  },
  {
    tableName: 'testimonials',
    timestamps: true,
    underscored: true,
  }
)

module.exports = Testimonial
