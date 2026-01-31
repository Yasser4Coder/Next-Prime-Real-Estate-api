import { models } from '../../models/index.js'

const { Property, Testimonial, Area, LocationList, Contact, SocialLink, FeaturedProperty } = models

/**
 * GET /api/site-data
 * Returns all public data in one payload (matches frontend DashboardStore shape for main site).
 */
export async function getSiteData(req, res) {
  try {
    const [properties, testimonials, areasRows, locationsRows, contactRow, socialRows, featuredRows] = await Promise.all([
      Property.findAll({ order: [['id', 'ASC']] }),
      Testimonial.findAll({ order: [['id', 'ASC']] }),
      Area.findAll({ order: [['id', 'ASC']] }),
      LocationList.findAll({ order: [['sortOrder', 'ASC'], ['id', 'ASC']] }),
      Contact.findOne(),
      SocialLink.findAll({ order: [['sortOrder', 'ASC'], ['id', 'ASC']] }),
      FeaturedProperty.findAll({ order: [['sortOrder', 'ASC']], attributes: ['propertyId'] }),
    ])

    const areas = areasRows.map((a) => ({
      id: a.id,
      name: a.name,
      subtitle: a.subtitle,
      center: [Number(a.centerLat), Number(a.centerLng)],
    }))
    const locationsList = locationsRows.map((l) => l.name)
    const contact = contactRow
      ? {
          phoneDisplay: contactRow.phoneDisplay,
          phoneTel: contactRow.phoneTel,
          email: contactRow.email,
          whatsappText: contactRow.whatsappText,
        }
      : {
          phoneDisplay: '+971 52 778 0718',
          phoneTel: '+971527780718',
          email: 'contact@nextprimerealestate.com',
          whatsappText: "Hi Next Prime, I'm interested in your Dubai properties.",
        }
    const socialLinks = socialRows.map((s) => ({ name: s.name, href: s.href, icon: s.icon }))
    const featuredPropertyIds = featuredRows.map((f) => f.propertyId)

    return res.json({
      properties,
      testimonials,
      areas,
      locationsList,
      contact,
      socialLinks,
      featuredPropertyIds,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to get site data' })
  }
}
