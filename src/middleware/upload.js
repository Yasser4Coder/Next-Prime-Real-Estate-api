const multer = require('multer')

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /image\/(jpeg|jpg|png|gif|webp)/
    if (allowed.test(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only images (jpeg, png, gif, webp) are allowed'), false)
    }
  },
})

const uploadSingle = (fieldName) => upload.single(fieldName)
const uploadMultiple = (fieldName, maxCount = 10) => upload.array(fieldName, maxCount)
const uploadPropertyImages = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'photos', maxCount: 10 },
])

module.exports = { uploadSingle, uploadMultiple, uploadPropertyImages }
