const path = require('path')
const fs = require('fs')
const { models } = require('../../models')
const { uploadToCloudinary, deleteFromCloudinaryByUrl } = require('../../config/cloudinary')
const { Property } = models

const UPLOADS_DIR = path.join(__dirname, '../../../uploads/properties')

function ensureUploadsDir() {
  const dir = path.join(__dirname, '../../../uploads')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

function getApiBaseUrl(req) {
  const env = process.env.API_URL
  if (env) return env.replace(/\/$/, '')
  return `${req.protocol || 'http'}://${req.get('host') || 'localhost:3000'}`
}

function savePdfToServer(file, prefix, req) {
  if (!file || !file.buffer) return null
  ensureUploadsDir()
  const ext = path.extname(file.originalname) || '.pdf'
  const safeName = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`
  const filePath = path.join(UPLOADS_DIR, safeName)
  fs.writeFileSync(filePath, file.buffer)
  const baseUrl = getApiBaseUrl(req)
  return `${baseUrl}/uploads/properties/${safeName}`
}

function deleteServerPdfIfLocal(url) {
  if (!url || typeof url !== 'string') return
  const match = url.match(/\/uploads\/properties\/([^/?#]+)/)
  if (!match) return
  const filePath = path.join(UPLOADS_DIR, match[1])
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  } catch (e) {
    console.error('Failed to delete PDF:', filePath, e.message)
  }
}

function parsePrice(v) {
  if (v === '' || v == null) return 0
  const n = Number(v)
  return isNaN(n) ? 0 : n
}

function parseAddress(body) {
  return {
    line1: body.addressLine1?.trim() || body.location || 'Dubai',
    city: body.addressCity?.trim() || 'Dubai',
    country: body.addressCountry?.trim() || 'UAE',
    lat: parseFloat(body.addressLat) || 25.2,
    lng: parseFloat(body.addressLng) || 55.3,
  }
}

function parsePhotos(photos) {
  if (typeof photos === 'string') {
    const trimmed = photos.trim()
    if (!trimmed) return []
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) return parsed.filter((u) => typeof u === 'string')
    } catch {
      // not JSON, treat as newline-separated URLs
    }
    return trimmed.split(/\n/).map((s) => s.trim()).filter(Boolean)
  }
  if (Array.isArray(photos)) return photos.filter((u) => typeof u === 'string')
  return []
}

function getExistingPhotoUrls(photos) {
  if (Array.isArray(photos)) return photos.filter((u) => typeof u === 'string')
  if (typeof photos === 'string' && photos.trim()) {
    try {
      const parsed = JSON.parse(photos.trim())
      return Array.isArray(parsed) ? parsed.filter((u) => typeof u === 'string') : []
    } catch {
      return []
    }
  }
  return []
}

function parseJsonField(val, fallback = null) {
  if (val === undefined || val === null || val === '') return fallback
  if (typeof val === 'object') return val
  try {
    return JSON.parse(val)
  } catch {
    return fallback
  }
}

function parseOverview(body) {
  const fromJson = parseJsonField(body.overview)
  if (fromJson && typeof fromJson === 'object' && !Array.isArray(fromJson)) {
    const o = {}
    if (fromJson.areaSqft != null) o.areaSqft = Number(fromJson.areaSqft)
    if (fromJson.status != null && fromJson.status !== '') o.status = String(fromJson.status).trim()
    if (fromJson.yearBuilt != null) o.yearBuilt = Number(fromJson.yearBuilt)
    if (fromJson.garages != null) o.garages = Number(fromJson.garages)
    return o
  }
  const o = {}
  if (body.overviewAreaSqft != null && body.overviewAreaSqft !== '') o.areaSqft = Number(body.overviewAreaSqft)
  if (body.overviewStatus?.trim()) o.status = body.overviewStatus.trim()
  if (body.overviewYearBuilt != null && body.overviewYearBuilt !== '') o.yearBuilt = Number(body.overviewYearBuilt)
  if (body.overviewGarages != null && body.overviewGarages !== '') o.garages = Number(body.overviewGarages)
  return o
}

function parseHighlights(body) {
  const fromJson = parseJsonField(body.highlights)
  if (Array.isArray(fromJson)) return fromJson.filter((s) => typeof s === 'string')
  if (typeof body.highlights === 'string' && body.highlights.trim()) {
    return body.highlights.trim().split(/\n/).map((s) => s.trim()).filter(Boolean)
  }
  return []
}

function parseAgent(body) {
  const fromJson = parseJsonField(body.agent)
  if (fromJson && typeof fromJson === 'object') return fromJson
  if (body.agentPhone?.trim()) {
    return {
      name: body.agentName?.trim() || undefined,
      phone: body.agentPhone.trim(),
      email: body.agentEmail?.trim() || undefined,
    }
  }
  return null
}

async function list(req, res) {
  try {
    const list = await Property.findAll({ order: [['id', 'ASC']] })
    return res.json(list)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to list properties' })
  }
}

async function getOne(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    const property = await Property.findByPk(id)
    if (!property) return res.status(404).json({ error: 'Property not found' })
    return res.json(property)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to get property' })
  }
}

async function uploadFilesToCloudinary(files, folder = 'nextprime/properties') {
  const results = []
  const list = Array.isArray(files) ? files : (files ? [files] : [])
  for (const file of list) {
    const { url } = await uploadToCloudinary(file.buffer, file.mimetype, folder)
    results.push(url)
  }
  return results
}

async function create(req, res) {
  try {
    const body = req.body
    let imageUrl = (body.image && body.image.trim()) || ''
    const photoUrlsFromBody = parsePhotos(body.photos)

    const mainFile = req.files?.image?.[0]
    const galleryFiles = req.files?.photos || []
    const floorPlanFile = req.files?.floorPlanFile?.[0]
    const brochureFile = req.files?.brochureFile?.[0]

    if (mainFile) {
      const [url] = await uploadFilesToCloudinary([mainFile])
      imageUrl = url
    }
    const uploadedGalleryUrls = await uploadFilesToCloudinary(galleryFiles)
    if (!imageUrl) imageUrl = '/logo-icon.PNG'

    let floorPlanFileUrl = (body.floorPlanFile && body.floorPlanFile.trim()) || null
    if (floorPlanFile) {
      floorPlanFileUrl = savePdfToServer(floorPlanFile, 'floor-plan', req)
    }
    let brochureFileUrl = (body.brochureFile && body.brochureFile.trim()) || null
    if (brochureFile) {
      brochureFileUrl = savePdfToServer(brochureFile, 'brochure', req)
    }

    const photos = [
      imageUrl,
      ...uploadedGalleryUrls.filter((u) => u !== imageUrl),
      ...photoUrlsFromBody,
    ].filter(Boolean)
    const photosUnique = [...new Set(photos)]
    const address = parseAddress(body)
    const overview = parseOverview(body)
    const residenceOptions = parseJsonField(body.residenceOptions)
    const highlights = parseHighlights(body)
    const features = parseJsonField(body.features)
    const floorPlans = parseJsonField(body.floorPlans)
    const agent = parseAgent(body)

    const property = await Property.create({
      title: body.title,
      description: body.description || null,
      image: imageUrl,
      photos: photosUnique.length ? photosUnique : [imageUrl],
      floorPlanFile: floorPlanFileUrl,
      brochureFile: brochureFileUrl,
      location: body.location || null,
      price: parsePrice(body.price),
      type: body.type || 'Villa',
      purpose: body.purpose || 'buy',
      bedrooms: parseInt(body.bedrooms, 10) || 0,
      bathrooms: parseFloat(body.bathrooms) || 0,
      address,
      overview: Object.keys(overview).length ? overview : null,
      residenceOptions: Array.isArray(residenceOptions) ? residenceOptions : null,
      highlights: highlights.length ? highlights : null,
      features: features && typeof features === 'object' && !Array.isArray(features) ? features : null,
      floorPlans: Array.isArray(floorPlans) ? floorPlans : null,
      agent,
    })
    return res.status(201).json(property)
  } catch (err) {
    console.error(err)
    const status = err.statusCode === 400 ? 400 : 500
    const message = err.statusCode === 400 ? err.message : 'Failed to create property'
    return res.status(status).json({ error: message })
  }
}

async function update(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    const property = await Property.findByPk(id)
    if (!property) return res.status(404).json({ error: 'Property not found' })

    const body = req.body
    const photoUrlsFromBody = parsePhotos(body.photos)
    let imageUrl = (body.image && body.image.trim()) || (photoUrlsFromBody[0] || property.image)

    const mainFile = req.files?.image?.[0]
    const galleryFiles = req.files?.photos || []
    const floorPlanFile = req.files?.floorPlanFile?.[0]
    const brochureFile = req.files?.brochureFile?.[0]

    if (mainFile) {
      const [url] = await uploadFilesToCloudinary([mainFile])
      imageUrl = url
    }
    const uploadedGalleryUrls = await uploadFilesToCloudinary(galleryFiles)
    const newPhotos = [
      imageUrl,
      ...uploadedGalleryUrls.filter((u) => u !== imageUrl),
      ...photoUrlsFromBody,
    ].filter(Boolean)
    const photosUnique = [...new Set(newPhotos)]
    const oldPhotos = getExistingPhotoUrls(property.photos)
    const oldHero = property.image && typeof property.image === 'string' ? property.image : null
    const allOldUrls = [...new Set(oldHero ? [oldHero, ...oldPhotos] : oldPhotos)]
    const removed = allOldUrls.filter((u) => u && !photosUnique.includes(u))
    for (const url of removed) {
      await deleteFromCloudinaryByUrl(url)
    }

    let floorPlanFileUrl = property.floorPlanFile
    if (body.floorPlanFile !== undefined || floorPlanFile) {
      if (floorPlanFile) {
        deleteServerPdfIfLocal(property.floorPlanFile)
        floorPlanFileUrl = savePdfToServer(floorPlanFile, 'floor-plan', req)
      } else {
        const newVal = (body.floorPlanFile && body.floorPlanFile.trim()) || null
        if (!newVal && property.floorPlanFile) deleteServerPdfIfLocal(property.floorPlanFile)
        floorPlanFileUrl = newVal
      }
    }
    let brochureFileUrl = property.brochureFile
    if (body.brochureFile !== undefined || brochureFile) {
      if (brochureFile) {
        deleteServerPdfIfLocal(property.brochureFile)
        brochureFileUrl = savePdfToServer(brochureFile, 'brochure', req)
      } else {
        const newVal = (body.brochureFile && body.brochureFile.trim()) || null
        if (!newVal && property.brochureFile) deleteServerPdfIfLocal(property.brochureFile)
        brochureFileUrl = newVal
      }
    }

    const address = parseAddress(body)
    const overview = parseOverview(body)
    const residenceOptions = parseJsonField(body.residenceOptions)
    const highlights = parseHighlights(body)
    const features = parseJsonField(body.features)
    const floorPlans = parseJsonField(body.floorPlans)
    const agent = parseAgent(body)

    await property.update({
      title: body.title !== undefined ? body.title : property.title,
      description: body.description !== undefined ? body.description : property.description,
      image: imageUrl,
      photos: photosUnique.length ? photosUnique : [imageUrl],
      floorPlanFile: floorPlanFileUrl,
      brochureFile: brochureFileUrl,
      location: body.location !== undefined ? body.location : property.location,
      price: body.price !== undefined && body.price !== '' ? parsePrice(body.price) : property.price,
      type: body.type !== undefined ? body.type : property.type,
      purpose: body.purpose !== undefined ? body.purpose : property.purpose,
      bedrooms: body.bedrooms !== undefined && body.bedrooms !== '' ? parseInt(body.bedrooms, 10) : property.bedrooms,
      bathrooms: body.bathrooms !== undefined && body.bathrooms !== '' ? parseFloat(body.bathrooms) : property.bathrooms,
      address,
      overview: body.overview !== undefined || body.overviewAreaSqft !== undefined ? (Object.keys(overview).length ? overview : null) : property.overview,
      residenceOptions: body.residenceOptions !== undefined ? (Array.isArray(residenceOptions) ? residenceOptions : null) : property.residenceOptions,
      highlights: body.highlights !== undefined ? (highlights.length ? highlights : null) : property.highlights,
      features: body.features !== undefined ? (features && typeof features === 'object' && !Array.isArray(features) ? features : null) : property.features,
      floorPlans: body.floorPlans !== undefined ? (Array.isArray(floorPlans) ? floorPlans : null) : property.floorPlans,
      agent: body.agent !== undefined || body.agentPhone !== undefined ? agent : property.agent,
    })
    return res.json(property)
  } catch (err) {
    console.error(err)
    const status = err.statusCode === 400 ? 400 : 500
    const message = err.statusCode === 400 ? err.message : 'Failed to update property'
    return res.status(status).json({ error: message })
  }
}

async function remove(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    const property = await Property.findByPk(id)
    if (!property) return res.status(404).json({ error: 'Property not found' })
    const heroUrl = property.image && typeof property.image === 'string' ? property.image : null
    const galleryUrls = getExistingPhotoUrls(property.photos)
    const urlsToDelete = [...new Set(heroUrl ? [heroUrl, ...galleryUrls] : galleryUrls)]
    for (const url of urlsToDelete) {
      await deleteFromCloudinaryByUrl(url)
    }
    deleteServerPdfIfLocal(property.floorPlanFile)
    deleteServerPdfIfLocal(property.brochureFile)
    await property.destroy()
    return res.status(204).send()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to delete property' })
  }
}

module.exports = { list, getOne, create, update, remove }
