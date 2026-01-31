import bcrypt from 'bcryptjs'
import sequelize from '../config/database.js'
import '../models/index.js'
import { models } from '../models/index.js'

const { Admin, Contact, Area, LocationList, SocialLink } = models

const defaultAreas = [
  { id: 'dubai-marina', name: 'Dubai Marina', subtitle: 'Waterfront lifestyle & high-demand rentals', centerLat: 25.0807, centerLng: 55.1403 },
  { id: 'downtown', name: 'Downtown Dubai', subtitle: 'Prime CBD living near Burj Khalifa', centerLat: 25.1972, centerLng: 55.2744 },
  { id: 'palm-jumeirah', name: 'Palm Jumeirah', subtitle: 'Ultra-luxury beachfront residences', centerLat: 25.1124, centerLng: 55.1389 },
  { id: 'business-bay', name: 'Business Bay', subtitle: 'Modern towers & investment opportunities', centerLat: 25.1864, centerLng: 55.2727 },
  { id: 'jvc', name: 'Jumeirah Village Circle (JVC)', subtitle: 'Value-focused homes with strong ROI', centerLat: 25.0606, centerLng: 55.2056 },
  { id: 'dubai-hills', name: 'Dubai Hills Estate', subtitle: 'Green communities & family-friendly villas', centerLat: 25.0669, centerLng: 55.2343 },
]

const defaultLocations = [
  'Dubai Marina', 'Downtown Dubai', 'Palm Jumeirah', 'JBR (Jumeirah Beach Residence)',
  'Business Bay', 'Arabian Ranches', 'Dubai Hills Estate', 'Jumeirah Village Circle',
  'Dubai Creek Harbour', 'Emaar Beachfront',
]

const defaultSocial = [
  { name: 'Facebook', href: '#', icon: 'facebook', sortOrder: 0 },
  { name: 'LinkedIn', href: '#', icon: 'linkedin', sortOrder: 1 },
  { name: 'Twitter', href: '#', icon: 'twitter', sortOrder: 2 },
  { name: 'YouTube', href: '#', icon: 'youtube', sortOrder: 3 },
  { name: 'Instagram', href: 'https://www.instagram.com/nextprimerealestate/', icon: 'instagram', sortOrder: 4 },
]

async function seed() {
  try {
    await sequelize.authenticate()
    console.log('Database connected.')

    const adminCount = await Admin.count()
    if (adminCount === 0) {
      const hash = await bcrypt.hash('admin123', 10)
      await Admin.create({ email: 'admin@nextprimerealestate.com', passwordHash: hash })
      console.log('Created default admin: admin@nextprimerealestate.com / admin123')
    } else {
      console.log('Admin already exists, skipping.')
    }

    const contactCount = await Contact.count()
    if (contactCount === 0) {
      await Contact.create({
        phoneDisplay: '+971 52 778 0718',
        phoneTel: '+971527780718',
        email: 'contact@nextprimerealestate.com',
        whatsappText: "Hi Next Prime, I'm interested in your Dubai properties.",
      })
      console.log('Created default contact.')
    }

    const areaCount = await Area.count()
    if (areaCount === 0) {
      await Area.bulkCreate(defaultAreas)
      console.log('Created default areas.')
    }

    const locCount = await LocationList.count()
    if (locCount === 0) {
      await LocationList.bulkCreate(defaultLocations.map((name, i) => ({ name, sortOrder: i })))
      console.log('Created default locations list.')
    }

    const socialCount = await SocialLink.count()
    if (socialCount === 0) {
      await SocialLink.bulkCreate(defaultSocial)
      console.log('Created default social links.')
    }

    console.log('Seed completed.')
    process.exit(0)
  } catch (err) {
    console.error('Seed failed:', err)
    process.exit(1)
  }
}

seed()
