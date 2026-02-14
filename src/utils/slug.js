const { Op } = require('sequelize')

function slugify(text) {
  if (!text || typeof text !== 'string') return ''
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

async function generateUniqueSlug(Property, title, excludeId = null) {
  const base = slugify(title) || 'property'
  let slug = base
  let n = 1
  while (true) {
    const where = { slug }
    if (excludeId != null) where.id = { [Op.ne]: excludeId }
    const existing = await Property.findOne({ where })
    if (!existing) return slug
    slug = `${base}-${++n}`
  }
}

module.exports = { slugify, generateUniqueSlug }
