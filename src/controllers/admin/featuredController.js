const { models } = require('../../models')
const { FeaturedProperty } = models

async function list(req, res) {
  try {
    const list = await FeaturedProperty.findAll({
      order: [['sortOrder', 'ASC'], ['id', 'ASC']],
      attributes: ['propertyId'],
    })
    return res.json(list.map((f) => f.propertyId))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to list featured' })
  }
}

async function set(req, res) {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.map((id) => parseInt(id, 10)).filter((n) => !isNaN(n)) : []
    await FeaturedProperty.destroy({ where: {} })
    for (let i = 0; i < ids.length; i++) {
      await FeaturedProperty.create({ propertyId: ids[i], sortOrder: i })
    }
    const list = await FeaturedProperty.findAll({
      order: [['sortOrder', 'ASC']],
      attributes: ['propertyId'],
    })
    return res.json(list.map((f) => f.propertyId))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to set featured' })
  }
}

module.exports = { list, set }
