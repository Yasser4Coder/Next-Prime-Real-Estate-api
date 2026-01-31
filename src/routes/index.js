const express = require('express')
const adminRoutes = require('./admin')
const userRoutes = require('./user')

const router = express.Router()

router.use('/admin', adminRoutes)
router.use('/', userRoutes)

module.exports = router
