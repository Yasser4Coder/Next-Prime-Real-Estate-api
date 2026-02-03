const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Property = sequelize.define(
  'Property',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    image: {
      type: DataTypes.STRING(500),
      comment: 'Main image URL (Cloudinary or external)',
    },
    photos: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of image URLs for gallery',
    },
    video: {
      type: DataTypes.STRING(500),
      comment: 'Video URL (embed or direct) shown beside images',
    },
    floorPlanFile: {
      type: DataTypes.STRING(500),
      comment: 'URL to downloadable floor plan file (PDF)',
    },
    brochureFile: {
      type: DataTypes.STRING(500),
      comment: 'URL to downloadable brochure file (PDF)',
    },
    location: {
      type: DataTypes.STRING(255),
    },
    price: {
      type: DataTypes.DECIMAL(14, 2),
      defaultValue: 0,
    },
    type: {
      type: DataTypes.STRING(50),
      defaultValue: 'Villa',
    },
    purpose: {
      type: DataTypes.ENUM('buy', 'rent'),
      defaultValue: 'buy',
    },
    bedrooms: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    bathrooms: {
      type: DataTypes.DECIMAL(4, 1),
      defaultValue: 0,
    },
    address: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: '{ line1, city, country, lat, lng }',
    },
    overview: {
      type: DataTypes.JSON,
      defaultValue: null,
      comment: '{ areaSqft, status, yearBuilt, garages }',
    },
    residenceOptions: {
      type: DataTypes.JSON,
      defaultValue: null,
      comment: '[{ label, items: string[] }]',
    },
    highlights: {
      type: DataTypes.JSON,
      defaultValue: null,
      comment: 'string[]',
    },
    features: {
      type: DataTypes.JSON,
      defaultValue: null,
      comment: '{ [groupName]: string[] }',
    },
    floorPlans: {
      type: DataTypes.JSON,
      defaultValue: null,
      comment: '[{ id, title, image }]',
    },
    agent: {
      type: DataTypes.JSON,
      defaultValue: null,
      comment: '{ name?, phone, email? }',
    },
  },
  {
    tableName: 'properties',
    timestamps: true,
    underscored: true,
  }
)

module.exports = Property
