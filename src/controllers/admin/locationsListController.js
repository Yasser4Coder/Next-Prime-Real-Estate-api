import { models } from '../../models/index.js'

const { LocationList } = models

export async function list(req, res) {
  try {
    const list = await LocationList.findAll({ order: [['sortOrder', 'ASC'], ['id', 'ASC']] })
    return res.json(list.map((l) => l.name))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to list locations' })
  }
}

export async function add(req, res) {
  try {
    const name = (req.body.name && req.body.name.trim()) || ''
    if (!name) return res.status(400).json({ error: 'Name is required' })
    const existing = await LocationList.findOne({ where: { name } })
    if (existing) return res.status(400).json({ error: 'Location already exists' })
    await LocationList.create({ name })
    const list = await LocationList.findAll({ order: [['sortOrder', 'ASC'], ['id', 'ASC']] })
    return res.status(201).json(list.map((l) => l.name))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to add location' })
  }
}

export async function remove(req, res) {
  try {
    const name = decodeURIComponent(req.params.name)
    const row = await LocationList.findOne({ where: { name } })
    if (!row) return res.status(404).json({ error: 'Location not found' })
    await row.destroy()
    return res.status(204).send()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to remove location' })
  }
}
