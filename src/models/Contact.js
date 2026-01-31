const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Contact = sequelize.define(
  'Contact',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    phoneDisplay: {
      type: DataTypes.STRING(50),
      comment: 'Display format e.g. +971 52 778 0718',
    },
    phoneTel: {
      type: DataTypes.STRING(50),
      comment: 'For tel: link, no spaces',
    },
    email: {
      type: DataTypes.STRING(255),
    },
    whatsappText: {
      type: DataTypes.TEXT,
      comment: 'Prefill message for WhatsApp',
    },
  },
  {
    tableName: 'contact',
    timestamps: true,
    underscored: true,
  }
)

module.exports = Contact
