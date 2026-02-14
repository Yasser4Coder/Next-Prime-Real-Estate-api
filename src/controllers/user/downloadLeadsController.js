const { models } = require('../../models')
const { DownloadLead } = models

async function create(req, res) {
  try {
    const { fullName, phone, email, project, message, documentType } = req.body
    if (!fullName?.trim() || !phone?.trim() || !email?.trim() || !project?.trim()) {
      return res.status(400).json({ error: 'Full name, phone, email and project are required' })
    }
    if (!['brochure', 'floor-plan'].includes(documentType)) {
      return res.status(400).json({ error: 'Invalid document type' })
    }
    const lead = await DownloadLead.create({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      project: project.trim(),
      message: message?.trim() || null,
      documentType,
    })
    return res.status(201).json(lead)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to submit' })
  }
}

module.exports = { create }
