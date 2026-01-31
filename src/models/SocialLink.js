import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const SocialLink = sequelize.define(
  'SocialLink',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    href: {
      type: DataTypes.STRING(500),
    },
    icon: {
      type: DataTypes.STRING(50),
      comment: 'e.g. facebook, instagram',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: 'social_links',
    timestamps: true,
    underscored: true,
  }
)

export default SocialLink
