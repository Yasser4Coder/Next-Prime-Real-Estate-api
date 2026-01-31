import { models } from '../../models/index.js'

const { Property, FeaturedProperty } = models

export async function list(req, res) {
  try {
    const list = await Property.findAll({ order: [['id', 'ASC']] })
    return res.json(list)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to list properties' })
  }
}

export async function getOne(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    const property = await Property.findByPk(id)
    if (!property) return res.status(404).json({ error: 'Property not found' })
    return res.json(property)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to get property' })
  }
}

/** GET /api/featured-properties – featured property objects in dashboard order */
export async function featuredList(req, res) {
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
