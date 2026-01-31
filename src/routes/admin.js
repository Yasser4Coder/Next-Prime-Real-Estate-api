const express = require('express')
const { authAdmin } = require('../middleware/auth')
const { uploadSingle, uploadPropertyImages } = require('../middleware/upload')
const authController = require('../controllers/authController')
const propertiesController = require('../controllers/admin/propertiesController')
const testimonialsController = require('../controllers/admin/testimonialsController')
const areasController = require('../controllers/admin/areasController')
const locationsListController = require('../controllers/admin/locationsListController')
const contactController = require('../controllers/admin/contactController')
const socialController = require('../controllers/admin/socialController')
const featuredController = require('../controllers/admin/featuredController')
const uploadController = require('../controllers/uploadController')

const router = express.Router()

router.post('/login', authController.login)
router.use(authAdmin)

router.post('/upload/image', uploadSingle('image'), uploadController.uploadImage)
router.get('/properties', propertiesController.list)
router.get('/properties/:id', propertiesController.getOne)
router.post('/properties', uploadPropertyImages, propertiesController.create)
router.put('/properties/:id', uploadPropertyImages, propertiesController.update)
router.delete('/properties/:id', propertiesController.remove)

router.get('/testimonials', testimonialsController.list)
router.get('/testimonials/:id', testimonialsController.getOne)
router.post('/testimonials', testimonialsController.create)
router.put('/testimonials/:id', testimonialsController.update)
router.delete('/testimonials/:id', testimonialsController.remove)

router.get('/areas', areasController.list)
router.post('/areas', areasController.create)
router.put('/areas/:id', areasController.update)
router.delete('/areas/:id', areasController.remove)

router.get('/locations-list', locationsListController.list)
router.post('/locations-list', locationsListController.add)
router.delete('/locations-list/:name', locationsListController.remove)

router.get('/contact', contactController.get)
router.put('/contact', contactController.update)

router.get('/social', socialController.list)
router.put('/social', socialController.update)
router.delete('/social/:name', socialController.remove)

router.get('/featured', featuredController.list)
router.put('/featured', featuredController.set)

module.exports = router
