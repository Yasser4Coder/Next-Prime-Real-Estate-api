const multer = require('multer')

const storage = multer.memoryStorage()

const imageOnly = (req, file, cb) => {
  const allowed = /image\/(jpeg|jpg|png|gif|webp)/
  if (allowed.test(file.mimetype)) cb(null, true)
  else cb(new Error('Only images (jpeg, png, gif, webp) are allowed'), false)
}

const imageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageOnly,
})

// Property form: images (Cloudinary) + PDFs (server disk). No video.
// Use .any() so req.body gets ALL form fields (bedrooms, bathrooms, etc.); req.files is an array.
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max (images + PDFs)
  fileFilter: (req, file, cb) => {
    const isImage = /image\/(jpeg|jpg|png|gif|webp)/.test(file.mimetype)
    const isPdf = file.mimetype === 'application/pdf'
    if (isImage || isPdf) cb(null, true)
    else cb(new Error('Only images or PDF allowed'), false)
  },
})

const uploadSingle = (fieldName) => imageUpload.single(fieldName)
const uploadMultiple = (fieldName, maxCount = 10) => imageUpload.array(fieldName, maxCount)

const uploadPropertyImages = upload.any()

module.exports = { uploadSingle, uploadMultiple, uploadPropertyImages }
