const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const DownloadLead = sequelize.define(
  'DownloadLead',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    project: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Property/project name',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    documentType: {
      type: DataTypes.ENUM('brochure', 'floor-plan'),
      allowNull: false,
    },
    contacted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: 'download_leads',
    timestamps: true,
    underscored: true,
  }
)

module.exports = DownloadLead
