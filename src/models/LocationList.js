const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const LocationList = sequelize.define(
  'LocationList',
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
    purpose: {
      type: DataTypes.ENUM('buy', 'rent'),
      allowNull: false,
      defaultValue: 'buy',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: 'location_list',
    timestamps: true,
    underscored: true,
    indexes: [{ unique: true, fields: ['name', 'purpose'] }],
  }
)

module.exports = LocationList
