import jwt from 'jsonwebtoken'
import { models } from '../models/index.js'

const { Admin } = models

export function authAdmin(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret')
    Admin.findByPk(decoded.adminId)
      .then((admin) => {
        if (!admin) return res.status(401).json({ error: 'Invalid token' })
        req.admin = admin
        next()
      })
      .catch(() => res.status(401).json({ error: 'Invalid token' }))
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
