import express from 'express'
import { authAdmin } from '../middleware/auth.js'
import { uploadSingle, uploadPropertyImages } from '../middleware/upload.js'
import * as authController from '../controllers/authController.js'
import * as propertiesController from '../controllers/admin/propertiesController.js'
import * as testimonialsController from '../controllers/admin/testimonialsController.js'
import * as areasController from '../controllers/admin/areasController.js'
import * as locationsListController from '../controllers/admin/locationsListController.js'
import * as contactController from '../controllers/admin/contactController.js'
import * as socialController from '../controllers/admin/socialController.js'
import * as featuredController from '../controllers/admin/featuredController.js'
import * as uploadController from '../controllers/uploadController.js'

const router = express.Router()

// Auth (no middleware)
router.post('/login', authController.login)

// All routes below require admin auth
router.use(authAdmin)

// Upload image to Cloudinary (returns { url, publicId })
router.post('/upload/image', uploadSingle('image'), uploadController.uploadImage)

// Properties (optional: 1 main image + up to 10 gallery images in multipart)
router.get('/properties', propertiesController.list)
router.get('/properties/:id', propertiesController.getOne)
router.post('/properties', uploadPropertyImages, propertiesController.create)
router.put('/properties/:id', uploadPropertyImages, propertiesController.update)
router.delete('/properties/:id', propertiesController.remove)

// Testimonials
router.get('/testimonials', testimonialsController.list)
router.get('/testimonials/:id', testimonialsController.getOne)
router.post('/testimonials', testimonialsController.create)
router.put('/testimonials/:id', testimonialsController.update)
router.delete('/testimonials/:id', testimonialsController.remove)

// Areas (map)
router.get('/areas', areasController.list)
router.post('/areas', areasController.create)
router.put('/areas/:id', areasController.update)
router.delete('/areas/:id', areasController.remove)

// Locations list (search dropdown)
router.get('/locations-list', locationsListController.list)
router.post('/locations-list', locationsListController.add)
router.delete('/locations-list/:name', locationsListController.remove)

// Contact (single row)
router.get('/contact', contactController.get)
router.put('/contact', contactController.update)

// Social links
router.get('/social', socialController.list)
router.put('/social', socialController.update)
router.delete('/social/:name', socialController.remove)

// Featured property IDs
router.get('/featured', featuredController.list)
router.put('/featured', featuredController.set)

export default router
