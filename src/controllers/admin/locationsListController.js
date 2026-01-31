const { models } = require('../../models')
const { LocationList } = models

async function list(req, res) {
  try {
    const rows = await LocationList.findAll({ order: [['sortOrder', 'ASC'], ['id', 'ASC']] })
    const buy = rows.filter((l) => (l.purpose || 'buy') === 'buy').map((l) => l.name)
    const rent = rows.filter((l) => l.purpose === 'rent').map((l) => l.name)
    return res.json({ buy, rent })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to list locations' })
  }
}

async function add(req, res) {
  try {
    const name = (req.body.name && req.body.name.trim()) || ''
    const purpose = req.body.purpose === 'rent' ? 'rent' : 'buy'
    if (!name) return res.status(400).json({ error: 'Name is required' })
    const existing = await LocationList.findOne({ where: { name, purpose } })
    if (existing) return res.status(400).json({ error: 'Location already exists for this purpose' })
    await LocationList.create({ name, purpose })
    const rows = await LocationList.findAll({ order: [['sortOrder', 'ASC'], ['id', 'ASC']] })
    const buy = rows.filter((l) => (l.purpose || 'buy') === 'buy').map((l) => l.name)
    const rent = rows.filter((l) => l.purpose === 'rent').map((l) => l.name)
    return res.status(201).json({ buy, rent })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to add location' })
  }
}

async function remove(req, res) {
  try {
    const name = decodeURIComponent(req.params.name)
    const purpose = req.query.purpose === 'rent' ? 'rent' : 'buy'
    const row = await LocationList.findOne({ where: { name, purpose } })
    if (!row) return res.status(404).json({ error: 'Location not found' })
    await row.destroy()
    return res.status(204).send()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to remove location' })
  }
}

module.exports = { list, add, remove }
