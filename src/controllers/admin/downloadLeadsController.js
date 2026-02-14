const { models } = require('../../models')
const { DownloadLead } = models

async function list(req, res) {
  try {
    const leads = await DownloadLead.findAll({
      order: [['createdAt', 'DESC']],
    })
    return res.json(leads)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to list download leads' })
  }
}

async function update(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    const lead = await DownloadLead.findByPk(id)
    if (!lead) return res.status(404).json({ error: 'Lead not found' })
    const { contacted } = req.body
    if (typeof contacted === 'boolean') {
      await lead.update({ contacted })
    }
    return res.json(lead)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to update lead' })
  }
}

async function remove(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    const lead = await DownloadLead.findByPk(id)
    if (!lead) return res.status(404).json({ error: 'Lead not found' })
    await lead.destroy()
    return res.status(204).send()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to delete lead' })
  }
}

module.exports = { list, update, remove }
