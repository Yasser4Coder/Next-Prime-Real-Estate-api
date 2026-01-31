import { models } from '../../models/index.js'
import { uploadToCloudinary, deleteFromCloudinaryByUrl } from '../../config/cloudinary.js'

const { Property } = models

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

/** Get existing photos as array of URL strings (handles JSON column returned as string) */
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
    const parsed = JSON.parse(val)
    return parsed
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

export async function list(req, res) {
  try {
    const list = await Property.findAll({ order: [['id', 'ASC']] })
    return res.json(list)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to list properties' })
  }
}

export async function getOne(req, res) {
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

export async function create(req, res) {
  try {
    const body = req.body
    let imageUrl = (body.image && body.image.trim()) || ''
    const photoUrlsFromBody = parsePhotos(body.photos)

    const mainFile = req.files?.image?.[0]
    const galleryFiles = req.files?.photos || []

    if (mainFile) {
      const [url] = await uploadFilesToCloudinary([mainFile])
      imageUrl = url
    }
    const uploadedGalleryUrls = await uploadFilesToCloudinary(galleryFiles)
    if (!imageUrl) imageUrl = '/logo-icon.PNG'

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
    return res.status(500).json({ error: 'Failed to create property' })
  }
}

export async function update(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    const property = await Property.findByPk(id)
    if (!property) return res.status(404).json({ error: 'Property not found' })

    const body = req.body
    const photoUrlsFromBody = parsePhotos(body.photos)
    let imageUrl = (body.image && body.image.trim()) || (photoUrlsFromBody[0] || property.image)

    const mainFile = req.files?.image?.[0]
    const galleryFiles = req.files?.photos || []

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
    return res.status(500).json({ error: 'Failed to update property' })
  }
}

export async function remove(req, res) {
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
    await property.destroy()
    return res.status(204).send()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to delete property' })
  }
}
