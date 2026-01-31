import { uploadToCloudinary } from '../config/cloudinary.js'

/**
 * POST /api/upload/image
 * Body: multipart file (field name: image)
 * Returns: { url, publicId }
 */
export async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }
    const folder = req.body.folder || 'nextprime'
    const { url, publicId } = await uploadToCloudinary(
      req.file.buffer,
      req.file.mimetype,
      folder
    )
    return res.json({ url, publicId })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Upload failed' })
  }
}
