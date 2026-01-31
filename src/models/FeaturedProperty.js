const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const FeaturedProperty = sequelize.define(
  'FeaturedProperty',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    propertyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: 'properties', key: 'id' },
      onDelete: 'CASCADE',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: 'featured_properties',
    timestamps: true,
    underscored: true,
  }
)

module.exports = FeaturedProperty
