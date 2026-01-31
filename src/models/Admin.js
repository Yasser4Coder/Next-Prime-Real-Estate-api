import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Admin = sequelize.define(
  'Admin',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: 'admins',
    timestamps: true,
    underscored: true,
  }
)

export default Admin
