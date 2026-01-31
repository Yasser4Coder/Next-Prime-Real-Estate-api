import sequelize from '../config/database.js'
import Admin from './Admin.js'
import Property from './Property.js'
import Testimonial from './Testimonial.js'
import Area from './Area.js'
import LocationList from './LocationList.js'
import Contact from './Contact.js'
import SocialLink from './SocialLink.js'
import FeaturedProperty from './FeaturedProperty.js'

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
}

export { sequelize, models }
export default models
