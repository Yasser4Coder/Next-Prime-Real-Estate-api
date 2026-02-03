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
 * @param {Buffer} buffer
 * @param {string} mimetype - e.g. image/jpeg, video/mp4, application/pdf
 * @param {string} folder
 * @param {string} [resourceType] - 'image' | 'video' | 'raw'. Inferred from mimetype if not set.
 */
async function uploadToCloudinary(buffer, mimetype = 'image/jpeg', folder = 'nextprime', resourceType) {
  const base64 = `data:${mimetype};base64,${buffer.toString('base64')}`
  const type = resourceType || (mimetype.startsWith('video/') ? 'video' : mimetype === 'application/pdf' || mimetype.startsWith('application/') ? 'raw' : 'image')
  const options = { folder }
  if (type !== 'image') options.resource_type = type
  const result = await cloudinary.uploader.upload(base64, options)
  return { url: result.secure_url, publicId: result.public_id }
}

async function uploadFromUrl(imageUrl, folder = 'nextprime') {
  const result = await cloudinary.uploader.upload(imageUrl, { folder })
  return { url: result.secure_url, publicId: result.public_id }
}

function getPublicIdFromUrl(url) {
  if (!url || typeof url !== 'string') return null
  const match = url.match(/cloudinary\.com\/[^/]+\/(image|video|raw)\/upload\/(?:v\d+\/)?(.+)/)
  if (!match) return null
  const withExt = match[2]
  const lastDot = withExt.lastIndexOf('.')
  return lastDot > 0 ? withExt.slice(0, lastDot) : withExt
}

function getResourceTypeFromUrl(url) {
  if (!url || typeof url !== 'string') return 'image'
  const match = url.match(/cloudinary\.com\/[^/]+\/(image|video|raw)\/upload\//)
  return match ? match[1] : 'image'
}

async function deleteFromCloudinaryByUrl(url, resourceType) {
  const publicId = getPublicIdFromUrl(url)
  if (!publicId) return false
  const type = resourceType || getResourceTypeFromUrl(url)
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: type })
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
  getResourceTypeFromUrl,
  deleteFromCloudinaryByUrl,
}
