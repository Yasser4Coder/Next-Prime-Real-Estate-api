const { v2: cloudinary } = require('cloudinary')
const dotenv = require('dotenv')

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Upload a file (buffer) to Cloudinary.
 */
async function uploadToCloudinary(buffer, mimetype = 'image/jpeg', folder = 'nextprime') {
  const base64 = `data:${mimetype};base64,${buffer.toString('base64')}`
  const result = await cloudinary.uploader.upload(base64, { folder })
  return { url: result.secure_url, publicId: result.public_id }
}

async function uploadFromUrl(imageUrl, folder = 'nextprime') {
  const result = await cloudinary.uploader.upload(imageUrl, { folder })
  return { url: result.secure_url, publicId: result.public_id }
}

function getPublicIdFromUrl(url) {
  if (!url || typeof url !== 'string') return null
  const match = url.match(/cloudinary\.com\/[^/]+\/image\/upload\/(?:v\d+\/)?(.+)/)
  if (!match) return null
  const withExt = match[1]
  const lastDot = withExt.lastIndexOf('.')
  return lastDot > 0 ? withExt.slice(0, lastDot) : withExt
}

async function deleteFromCloudinaryByUrl(url) {
  const publicId = getPublicIdFromUrl(url)
  if (!publicId) return false
  try {
    await cloudinary.uploader.destroy(publicId)
    return true
  } catch (err) {
    console.error('Cloudinary destroy failed:', publicId, err.message)
    return false
  }
}

module.exports = {
  cloudinary,
  uploadToCloudinary,
  uploadFromUrl,
  getPublicIdFromUrl,
  deleteFromCloudinaryByUrl,
}
