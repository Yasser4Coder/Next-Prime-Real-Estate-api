import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

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
      unique: true,
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
  }
)

export default LocationList
