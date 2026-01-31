import express from 'express'
import adminRoutes from './admin.js'
import userRoutes from './user.js'

const router = express.Router()

router.use('/admin', adminRoutes)
router.use('/', userRoutes)

export default router
