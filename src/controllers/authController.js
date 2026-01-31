import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { models } from '../models/index.js'

const { Admin } = models
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'
const JWT_EXPIRES = '7d'

export async function login(req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const emailNorm = email.trim().toLowerCase()
    const lookup = emailNorm === 'admin' ? 'admin@nextprimerealestate.com' : emailNorm
    const admin = await Admin.findOne({ where: { email: lookup } })
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const match = await bcrypt.compare(password, admin.passwordHash)
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign({ adminId: admin.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
    return res.json({ token, admin: { id: admin.id, email: admin.email } })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}
