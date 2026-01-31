import express from 'express'
import * as siteDataController from '../controllers/user/siteDataController.js'
import * as propertiesController from '../controllers/user/propertiesController.js'

const router = express.Router()

// Single endpoint that returns all site data (for main website)
router.get('/site-data', siteDataController.getSiteData)

// Properties (public read)
router.get('/properties', propertiesController.list)
router.get('/properties/:id', propertiesController.getOne)
router.get('/featured-properties', propertiesController.featuredList)

export default router
