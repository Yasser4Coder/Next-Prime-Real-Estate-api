const { models } = require('../../models')
const { Property, Testimonial, Area, LocationList, Contact, SocialLink, FeaturedProperty } = models

async function getSiteData(req, res) {
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
    const locationsBuy = locationsRows.filter((l) => (l.purpose || 'buy') === 'buy').map((l) => l.name)
    const locationsRent = locationsRows.filter((l) => l.purpose === 'rent').map((l) => l.name)
    const locationsOffPlan = locationsRows.filter((l) => l.purpose === 'off-plan').map((l) => l.name)
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

    const propertiesSerialized = properties.map((p) => {
      const row = p.toJSON ? p.toJSON() : (typeof p.get === 'function' ? p.get() : { ...p })
      row.bedrooms = p.bedrooms != null ? String(p.bedrooms) : null
      row.bathrooms = p.bathrooms != null ? String(p.bathrooms) : null
      return row
    })

    return res.json({
      properties: propertiesSerialized,
      testimonials,
      areas,
      locationsBuy,
      locationsRent,
      locationsOffPlan,
      contact,
      socialLinks,
      featuredPropertyIds,
    })
  } catch (err) {
    console.error('getSiteData error:', err.message || err)
    const message = err.message || String(err)
    return res.status(500).json({
      error: 'Failed to get site data',
      detail: message,
    })
  }
}

module.exports = { getSiteData }
