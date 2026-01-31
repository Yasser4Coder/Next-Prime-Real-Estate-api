const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Area = sequelize.define(
  'Area',
  {
    id: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      comment: 'Slug e.g. dubai-marina',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    subtitle: {
      type: DataTypes.STRING(255),
    },
    centerLat: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: false,
    },
    centerLng: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: false,
    },
  },
  {
    tableName: 'areas',
    timestamps: true,
    underscored: true,
  }
)

module.exports = Area
