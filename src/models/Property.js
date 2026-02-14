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
    slug: {
      type: DataTypes.STRING(255),
      unique: true,
      comment: 'URL-friendly identifier, e.g. dubai-marina-luxury-villa',
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
    priceDisplay: {
      type: DataTypes.STRING(100),
      comment: 'e.g. "On Request" – shown instead of formatted price when set',
    },
    type: {
      type: DataTypes.STRING(50),
      defaultValue: 'Villa',
    },
    purpose: {
      type: DataTypes.ENUM('buy', 'rent', 'off-plan'),
      defaultValue: 'buy',
    },
    bedrooms: {
      type: DataTypes.STRING(100),
      comment: 'e.g. "3" or "Studio – 1 – 2 – 3"',
    },
    bathrooms: {
      type: DataTypes.STRING(100),
      comment: 'e.g. "2" or "1 – 3 (حسب الوحدة)"',
    },
    address: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: '{ line1, city, country, lat, lng }',
    },
    overview: {
      type: DataTypes.JSON,
      defaultValue: null,
      comment: '{ areaSqft, areaText, status, yearBuilt, garages, buildingConfiguration, projectType }',
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
