const { models } = require('../../models')
const { Contact } = models

async function get(req, res) {
  try {
    let contact = await Contact.findOne()
    if (!contact) {
      contact = await Contact.create({
        phoneDisplay: '+971 52 778 0718',
        phoneTel: '+971527780718',
        email: 'contact@nextprimerealestate.com',
        whatsappText: "Hi Next Prime, I'm interested in your Dubai properties.",
      })
    }
    return res.json(contact)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to get contact' })
  }
}

async function update(req, res) {
  try {
    let contact = await Contact.findOne()
    if (!contact) {
      contact = await Contact.create({
        phoneDisplay: req.body.phoneDisplay || '',
        phoneTel: (req.body.phoneTel || '').replace(/\s/g, ''),
        email: req.body.email || '',
        whatsappText: req.body.whatsappText || '',
      })
      return res.json(contact)
    }
    await contact.update({
      phoneDisplay: req.body.phoneDisplay !== undefined ? String(req.body.phoneDisplay).trim() : contact.phoneDisplay,
      phoneTel: req.body.phoneTel !== undefined ? String(req.body.phoneTel).replace(/\s/g, '') : contact.phoneTel,
      email: req.body.email !== undefined ? String(req.body.email).trim() : contact.email,
      whatsappText: req.body.whatsappText !== undefined ? String(req.body.whatsappText).trim() : contact.whatsappText,
    })
    return res.json(contact)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to update contact' })
  }
}

module.exports = { get, update }
