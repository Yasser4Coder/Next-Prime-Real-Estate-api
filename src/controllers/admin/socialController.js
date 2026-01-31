const { models } = require('../../models')
const { SocialLink } = models

async function list(req, res) {
  try {
    const list = await SocialLink.findAll({ order: [['sortOrder', 'ASC'], ['id', 'ASC']] })
    return res.json(list.map((s) => ({ name: s.name, href: s.href, icon: s.icon })))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to list social links' })
  }
}

async function update(req, res) {
  try {
    const body = req.body
    const name = (body.name && body.name.trim()) || 'Facebook'
    const href = (body.href && body.href.trim()) || ''
    const icon = (body.icon && body.icon.trim()) || name.toLowerCase()

    let link = await SocialLink.findOne({ where: { name } })
    if (link) {
      await link.update({ href, icon })
    } else {
      link = await SocialLink.create({ name, href, icon, sortOrder: 0 })
    }
    const list = await SocialLink.findAll({ order: [['sortOrder', 'ASC'], ['id', 'ASC']] })
    return res.json(list.map((s) => ({ name: s.name, href: s.href, icon: s.icon })))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to update social link' })
  }
}

async function remove(req, res) {
  try {
    const name = decodeURIComponent(req.params.name)
    const row = await SocialLink.findOne({ where: { name } })
    if (!row) return res.status(404).json({ error: 'Social link not found' })
    await row.destroy()
    return res.status(204).send()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to remove social link' })
  }
}

module.exports = { list, update, remove }
