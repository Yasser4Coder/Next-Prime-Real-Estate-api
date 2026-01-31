import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Upload a file (buffer) to Cloudinary.
 * @param {Buffer} buffer - File buffer from multer
 * @param {string} mimetype - e.g. 'image/jpeg'
 * @param {string} folder - Optional folder name (e.g. 'properties', 'testimonials')
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export async function uploadToCloudinary(buffer, mimetype = 'image/jpeg', folder = 'nextprime') {
  const base64 = `data:${mimetype};base64,${buffer.toString('base64')}`
  const result = await cloudinary.uploader.upload(base64, { folder })
  return { url: result.secure_url, publicId: result.public_id }
}

/**
 * Upload from a URL (e.g. when admin pastes image URL we can optionally re-upload to Cloudinary).
 * @param {string} imageUrl - Public image URL
 * @param {string} folder
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export async function uploadFromUrl(imageUrl, folder = 'nextprime') {
  const result = await cloudinary.uploader.upload(imageUrl, { folder })
  return { url: result.secure_url, publicId: result.public_id }
}

/**
 * Extract Cloudinary public_id from a secure_url (e.g. for destroy).
 * URL format: https://res.cloudinary.com/cloud/image/upload/v123/folder/path.ext
 * @param {string} url
 * @returns {string|null} public_id or null if not a Cloudinary URL
 */
export function getPublicIdFromUrl(url) {
  if (!url || typeof url !== 'string') return null
  const match = url.match(/cloudinary\.com\/[^/]+\/image\/upload\/(?:v\d+\/)?(.+)/)
  if (!match) return null
  const withExt = match[1]
  const lastDot = withExt.lastIndexOf('.')
  return lastDot > 0 ? withExt.slice(0, lastDot) : withExt
}

/**
 * Delete an image from Cloudinary by URL (extracts public_id and destroys).
 * @param {string} url - Cloudinary secure_url
 * @returns {Promise<boolean>} true if deleted, false if not Cloudinary or error
 */
export async function deleteFromCloudinaryByUrl(url) {
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

export { cloudinary }
