import multer from 'multer'

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

export const uploadSingle = (fieldName) => upload.single(fieldName)
export const uploadMultiple = (fieldName, maxCount = 10) => upload.array(fieldName, maxCount)

/** Main image (1) + gallery images (up to 10). Use in property create/update. */
export const uploadPropertyImages = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'photos', maxCount: 10 },
])
