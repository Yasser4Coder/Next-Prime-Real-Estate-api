const { models } = require('../../models')
const { Property, FeaturedProperty } = models
const { generateUniqueSlug } = require('../../utils/slug')

async function list(req, res) {
  try {
    const list = await Property.findAll({ order: [['id', 'ASC']] })
    return res.json(list)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to list properties' })
  }
}

async function getOne(req, res) {
  try {
    const param = req.params.id
    const isNumeric = /^\d+$/.test(param)
    let property
    if (isNumeric) {
      property = await Property.findByPk(parseInt(param, 10))
      if (property && !property.slug) {
        property.slug = await generateUniqueSlug(Property, property.title, property.id)
        await property.save()
      }
    } else {
      property = await Property.findOne({ where: { slug: param } })
    }
    if (!property) return res.status(404).json({ error: 'Property not found' })
    const data = typeof property.toJSON === 'function' ? property.toJSON() : (typeof property.get === 'function' ? property.get() : { ...property })
    data.bedrooms = property.bedrooms != null && String(property.bedrooms).trim() !== '' ? String(property.bedrooms) : (property.bedrooms != null ? String(property.bedrooms) : null)
    data.bathrooms = property.bathrooms != null && String(property.bathrooms).trim() !== '' ? String(property.bathrooms) : (property.bathrooms != null ? String(property.bathrooms) : null)
    return res.json(data)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to get property' })
  }
}

async function featuredList(req, res) {
  try {
    const rows = await FeaturedProperty.findAll({
      order: [['sortOrder', 'ASC'], ['id', 'ASC']],
      include: [{ model: Property, required: true }],
    })
    const properties = rows.map((row) => row.Property)
    return res.json(properties)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to get featured properties' })
  }
}

module.exports = { list, getOne, featuredList }
