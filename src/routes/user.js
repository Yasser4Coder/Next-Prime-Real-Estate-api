const express = require('express')
const siteDataController = require('../controllers/user/siteDataController')
const propertiesController = require('../controllers/user/propertiesController')

const router = express.Router()

router.get('/site-data', siteDataController.getSiteData)
router.get('/properties', propertiesController.list)
router.get('/properties/:id', propertiesController.getOne)
router.get('/featured-properties', propertiesController.featuredList)

module.exports = router
