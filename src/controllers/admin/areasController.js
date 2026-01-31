const { models } = require('../../models')
const { Area } = models

function slugify(name) {
  return (name || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

async function list(req, res) {
  try {
    const list = await Area.findAll({ order: [['id', 'ASC']] })
    const formatted = list.map((a) => ({
      id: a.id,
      name: a.name,
      subtitle: a.subtitle,
      center: [Number(a.centerLat), Number(a.centerLng)],
    }))
    return res.json(formatted)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to list areas' })
  }
}

async function create(req, res) {
  try {
    const body = req.body
    const name = (body.name && body.name.trim()) || ''
    const id = body.id || slugify(name) || 'area'
    const area = await Area.create({
      id,
      name,
      subtitle: body.subtitle?.trim() || null,
      centerLat: parseFloat(body.lat) || 25.2,
      centerLng: parseFloat(body.lng) || 55.3,
    })
    return res.status(201).json({
      id: area.id,
      name: area.name,
      subtitle: area.subtitle,
      center: [Number(area.centerLat), Number(area.centerLng)],
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to create area' })
  }
}

async function update(req, res) {
  try {
    const id = req.params.id
    const area = await Area.findByPk(id)
    if (!area) return res.status(404).json({ error: 'Area not found' })
    const body = req.body
    await area.update({
      name: body.name !== undefined ? (body.name && body.name.trim()) || area.name : area.name,
      subtitle: body.subtitle !== undefined ? body.subtitle?.trim() || null : area.subtitle,
      centerLat: body.lat !== undefined ? parseFloat(body.lat) || area.centerLat : area.centerLat,
      centerLng: body.lng !== undefined ? parseFloat(body.lng) || area.centerLng : area.centerLng,
    })
    return res.json({
      id: area.id,
      name: area.name,
      subtitle: area.subtitle,
      center: [Number(area.centerLat), Number(area.centerLng)],
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to update area' })
  }
}

async function remove(req, res) {
  try {
    const id = req.params.id
    const area = await Area.findByPk(id)
    if (!area) return res.status(404).json({ error: 'Area not found' })
    await area.destroy()
    return res.status(204).send()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to delete area' })
  }
}

module.exports = { list, create, update, remove }
