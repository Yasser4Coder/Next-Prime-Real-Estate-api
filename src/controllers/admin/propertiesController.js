const path = require('path')
const fs = require('fs')
const { models, sequelize } = require('../../models')
const { generateUniqueSlug } = require('../../utils/slug')
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

/** Year built: number if numeric year, otherwise string (e.g. "Under Construction"). */
function parseYearBuilt(v) {
  if (v === '' || v == null) return undefined
  const s = String(v).trim()
  if (!s) return undefined
  const n = Number(s)
  if (!Number.isNaN(n) && n >= 1000 && n <= 2100) return n
  return s
}

/** Garages: number if a single non-negative integer, otherwise string (e.g. "1–2"). */
function parseGarages(v) {
  if (v === '' || v == null) return undefined
  const s = String(v).trim()
  if (!s) return undefined
  const n = Number(s)
  if (!Number.isNaN(n) && Number.isInteger(n) && n >= 0) return n
  return s
}

/** Get string from body (multipart can send arrays for some fields). Never parse as number. */
function getBodyStr(body, key) {
  if (!body || typeof body !== 'object') return undefined
  const v = body[key]
  if (v == null) return undefined
  if (Array.isArray(v)) return v[0] != null ? String(v[0]).trim() : undefined
  return String(v).trim()
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
    if (fromJson.areaText != null && fromJson.areaText !== '') o.areaText = String(fromJson.areaText).trim()
    if (fromJson.status != null && fromJson.status !== '') o.status = String(fromJson.status).trim()
    if (fromJson.yearBuilt != null && fromJson.yearBuilt !== '') o.yearBuilt = parseYearBuilt(fromJson.yearBuilt)
    if (fromJson.garages != null && fromJson.garages !== '') o.garages = parseGarages(fromJson.garages)
    if (fromJson.buildingConfiguration != null && fromJson.buildingConfiguration !== '') o.buildingConfiguration = String(fromJson.buildingConfiguration).trim()
    if (fromJson.projectType != null && fromJson.projectType !== '') o.projectType = String(fromJson.projectType).trim()
    return o
  }
  const o = {}
  if (body.overviewAreaSqft != null && body.overviewAreaSqft !== '') o.areaSqft = Number(body.overviewAreaSqft)
  if (body.overviewAreaText != null && String(body.overviewAreaText).trim() !== '') o.areaText = String(body.overviewAreaText).trim()
  if (body.overviewStatus?.trim()) o.status = body.overviewStatus.trim()
  if (body.overviewYearBuilt != null && body.overviewYearBuilt !== '') o.yearBuilt = parseYearBuilt(body.overviewYearBuilt)
  if (body.overviewGarages != null && body.overviewGarages !== '') o.garages = parseGarages(body.overviewGarages)
  if (body.overviewBuildingConfiguration != null && String(body.overviewBuildingConfiguration).trim() !== '') o.buildingConfiguration = String(body.overviewBuildingConfiguration).trim()
  if (body.overviewProjectType != null && String(body.overviewProjectType).trim() !== '') o.projectType = String(body.overviewProjectType).trim()
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

/** When using multer.any(), req.files is an array; normalize to { image, photos, floorPlanFile, brochureFile } */
function getFilesFromReq(files) {
  if (!Array.isArray(files)) return { image: [], photos: [], floorPlanFile: [], brochureFile: [] }
  return {
    image: files.filter((f) => f.fieldname === 'image'),
    photos: files.filter((f) => f.fieldname === 'photos'),
    floorPlanFile: files.filter((f) => f.fieldname === 'floorPlanFile'),
    brochureFile: files.filter((f) => f.fieldname === 'brochureFile'),
  }
}

async function create(req, res) {
  try {
    const body = req.body
    let imageUrl = (body.image && body.image.trim()) || ''
    const photoUrlsFromBody = parsePhotos(body.photos)

    const files = getFilesFromReq(req.files)
    const mainFile = files.image[0]
    const galleryFiles = files.photos
    const floorPlanFile = files.floorPlanFile[0]
    const brochureFile = files.brochureFile[0]

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
    const slug = await generateUniqueSlug(Property, body.title || 'property')

    const bedroomsVal = (() => { const s = getBodyStr(body, 'bedrooms'); return s != null && s !== '' ? s : null })()
    const bathroomsVal = (() => { const s = getBodyStr(body, 'bathrooms'); return s != null && s !== '' ? s : null })()
    const priceDisplayVal = (() => { const s = getBodyStr(body, 'priceDisplay') ?? getBodyStr(body, 'price_display'); return s != null && s !== '' ? s : null })()

    const property = await Property.create({
      title: body.title,
      slug,
      description: body.description || null,
      image: imageUrl,
      photos: photosUnique.length ? photosUnique : [imageUrl],
      floorPlanFile: floorPlanFileUrl,
      brochureFile: brochureFileUrl,
      location: body.location || null,
      price: parsePrice(body.price),
      priceDisplay: priceDisplayVal,
      type: body.type || 'Villa',
      purpose: body.purpose || 'buy',
      bedrooms: bedroomsVal,
      bathrooms: bathroomsVal,
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

    const files = getFilesFromReq(req.files)
    const mainFile = files.image[0]
    const galleryFiles = files.photos
    const floorPlanFile = files.floorPlanFile[0]
    const brochureFile = files.brochureFile[0]

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
    const residenceOptions = parseJsonField(body.residenceOptions)
    const highlights = parseHighlights(body)
    const features = parseJsonField(body.features)
    const floorPlans = parseJsonField(body.floorPlans)
    const agent = parseAgent(body)
    const titleChanged = body.title !== undefined && body.title !== property.title
    const titleForSlug = titleChanged ? body.title : property.title
    const newSlug = (titleChanged || !property.slug)
      ? await generateUniqueSlug(Property, titleForSlug, property.id)
      : property.slug

    const bedroomsRaw = getBodyStr(body, 'bedrooms') ?? (req.query.bedrooms != null ? String(req.query.bedrooms).trim() : undefined)
    const bathroomsRaw = getBodyStr(body, 'bathrooms') ?? (req.query.bathrooms != null ? String(req.query.bathrooms).trim() : undefined)
    const bedroomsVal = bedroomsRaw !== undefined ? (bedroomsRaw !== '' ? bedroomsRaw : null) : property.bedrooms
    const bathroomsVal = bathroomsRaw !== undefined ? (bathroomsRaw !== '' ? bathroomsRaw : null) : property.bathrooms
    const priceDisplayRaw = getBodyStr(body, 'priceDisplay') ?? getBodyStr(body, 'price_display')
    const priceDisplayVal = priceDisplayRaw !== undefined ? (priceDisplayRaw !== '' ? priceDisplayRaw : null) : property.priceDisplay

    const overviewFromBody = parseOverview(body)
    const hasOverviewFields =
      body.overviewAreaSqft !== undefined ||
      body.overviewAreaText !== undefined ||
      body.overviewStatus !== undefined ||
      body.overviewYearBuilt !== undefined ||
      body.overviewGarages !== undefined ||
      body.overviewBuildingConfiguration !== undefined ||
      body.overviewProjectType !== undefined ||
      (body.overview != null && typeof body.overview === 'object' && !Array.isArray(body.overview))
    const existingOverview = property.overview && typeof property.overview === 'object' ? property.overview : {}
    const mergedOverview = hasOverviewFields ? { ...existingOverview, ...overviewFromBody } : property.overview

    await property.update({
      slug: newSlug,
      title: body.title !== undefined ? body.title : property.title,
      description: body.description !== undefined ? body.description : property.description,
      image: imageUrl,
      photos: photosUnique.length ? photosUnique : [imageUrl],
      floorPlanFile: floorPlanFileUrl,
      brochureFile: brochureFileUrl,
      location: body.location !== undefined ? body.location : property.location,
      price: body.price !== undefined && body.price !== '' ? parsePrice(body.price) : property.price,
      priceDisplay: priceDisplayVal,
      type: body.type !== undefined ? body.type : property.type,
      purpose: body.purpose !== undefined ? body.purpose : property.purpose,
      bedrooms: bedroomsVal != null ? String(bedroomsVal) : null,
      bathrooms: bathroomsVal != null ? String(bathroomsVal) : null,
      address,
      overview: hasOverviewFields ? (Object.keys(mergedOverview).length ? mergedOverview : null) : property.overview,
      residenceOptions: body.residenceOptions !== undefined ? (Array.isArray(residenceOptions) ? residenceOptions : null) : property.residenceOptions,
      highlights: body.highlights !== undefined ? (highlights.length ? highlights : null) : property.highlights,
      features: body.features !== undefined ? (features && typeof features === 'object' && !Array.isArray(features) ? features : null) : property.features,
      floorPlans: body.floorPlans !== undefined ? (Array.isArray(floorPlans) ? floorPlans : null) : property.floorPlans,
      agent: body.agent !== undefined || body.agentPhone !== undefined ? agent : property.agent,
    })
    await sequelize.query(
      'UPDATE properties SET bedrooms = :bedrooms, bathrooms = :bathrooms WHERE id = :id',
      { replacements: { bedrooms: bedroomsVal, bathrooms: bathroomsVal, id: property.id } }
    )
    await property.reload()
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
