const sequelize = require('../config/database')
const Admin = require('./Admin')
const Property = require('./Property')
const Testimonial = require('./Testimonial')
const Area = require('./Area')
const LocationList = require('./LocationList')
const Contact = require('./Contact')
const SocialLink = require('./SocialLink')
const FeaturedProperty = require('./FeaturedProperty')
const DownloadLead = require('./DownloadLead')

// Associations
FeaturedProperty.belongsTo(Property, { foreignKey: 'propertyId' })
Property.hasMany(FeaturedProperty, { foreignKey: 'propertyId' })

const models = {
  Admin,
  Property,
  Testimonial,
  Area,
  LocationList,
  Contact,
  SocialLink,
  FeaturedProperty,
  DownloadLead,
}

module.exports = { sequelize, models }
module.exports.default = models
