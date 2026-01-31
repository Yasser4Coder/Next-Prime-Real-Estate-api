const { models } = require('../../models')
const { Testimonial } = models

function getInitials(name) {
  if (!name || typeof name !== 'string') return ''
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

async function list(req, res) {
  try {
    const list = await Testimonial.findAll({ order: [['id', 'ASC']] })
    return res.json(list)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to list testimonials' })
  }
}

async function getOne(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    const testimonial = await Testimonial.findByPk(id)
    if (!testimonial) return res.status(404).json({ error: 'Testimonial not found' })
    return res.json(testimonial)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to get testimonial' })
  }
}

async function create(req, res) {
  try {
    const body = req.body
    const name = (body.name && body.name.trim()) || ''
    const payload = {
      name,
      role: body.role?.trim() || null,
      location: body.location?.trim() || null,
      quote: (body.quote && body.quote.trim()) || '',
      rating: parseInt(body.rating, 10) || 5,
      initials: getInitials(name),
    }
    const testimonial = await Testimonial.create(payload)
    return res.status(201).json(testimonial)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to create testimonial' })
  }
}

async function update(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    const testimonial = await Testimonial.findByPk(id)
    if (!testimonial) return res.status(404).json({ error: 'Testimonial not found' })
    const body = req.body
    const name = body.name !== undefined ? (body.name && body.name.trim()) || '' : testimonial.name
    await testimonial.update({
      name: body.name !== undefined ? name : testimonial.name,
      role: body.role !== undefined ? body.role?.trim() || null : testimonial.role,
      location: body.location !== undefined ? body.location?.trim() || null : testimonial.location,
      quote: body.quote !== undefined ? (body.quote && body.quote.trim()) || '' : testimonial.quote,
      rating: body.rating !== undefined ? parseInt(body.rating, 10) || 5 : testimonial.rating,
      initials: body.name !== undefined ? getInitials(name) : testimonial.initials,
    })
    return res.json(testimonial)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to update testimonial' })
  }
}

async function remove(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    const testimonial = await Testimonial.findByPk(id)
    if (!testimonial) return res.status(404).json({ error: 'Testimonial not found' })
    await testimonial.destroy()
    return res.status(204).send()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to delete testimonial' })
  }
}

module.exports = { list, getOne, create, update, remove }
