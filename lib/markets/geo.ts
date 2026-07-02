// Utility geometriche pure (niente dipendenze): distanza haversine per
// l'ordinamento "più vicino a me" e poligoni per evidenziare le zone sulla mappa.

export interface LatLng {
  lat: number
  lng: number
}

const R = 6371000

/** Distanza in metri tra due coordinate (haversine). */
export function haversineMeters(a: LatLng, b: LatLng): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

/** Convex hull (monotone chain). Ritorna i vertici in senso orario. */
function convexHull(points: LatLng[]): LatLng[] {
  const pts = [...points].sort((a, b) => (a.lng === b.lng ? a.lat - b.lat : a.lng - b.lng))
  if (pts.length <= 2) return pts
  const cross = (o: LatLng, a: LatLng, b: LatLng) =>
    (a.lng - o.lng) * (b.lat - o.lat) - (a.lat - o.lat) * (b.lng - o.lng)
  const lower: LatLng[] = []
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop()
    lower.push(p)
  }
  const upper: LatLng[] = []
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i]
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop()
    upper.push(p)
  }
  lower.pop()
  upper.pop()
  return lower.concat(upper)
}

function centroid(points: LatLng[]): LatLng {
  const lat = points.reduce((s, p) => s + p.lat, 0) / points.length
  const lng = points.reduce((s, p) => s + p.lng, 0) / points.length
  return { lat, lng }
}

/** metri → gradi (lat costante, lng scalato per la latitudine). */
function metersToDeg(meters: number, lat: number) {
  return { dLat: meters / 111320, dLng: meters / (111320 * Math.cos((lat * Math.PI) / 180)) }
}

/**
 * Poligono morbido che racchiude i punti di una zona, con padding, per
 * evidenziarla sulla mappa. <3 punti → cerchio attorno al centroide.
 * Ritorna una Feature GeoJSON (anelli in [lng, lat]).
 */
export function zonePolygon(points: LatLng[], padMeters = 320): GeoJSON.Feature<GeoJSON.Polygon> | null {
  if (points.length === 0) return null
  const c = centroid(points)

  const circle = (center: LatLng, radiusMeters: number): [number, number][] => {
    const { dLat, dLng } = metersToDeg(radiusMeters, center.lat)
    const ring: [number, number][] = []
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * Math.PI * 2
      ring.push([center.lng + Math.cos(a) * dLng, center.lat + Math.sin(a) * dLat])
    }
    return ring
  }

  let ring: [number, number][]
  if (points.length < 3) {
    const spread = points.length === 2 ? haversineMeters(points[0], points[1]) / 2 : 0
    ring = circle(c, Math.max(spread + padMeters, 380))
  } else {
    const hull = convexHull(points)
    const { dLat, dLng } = metersToDeg(padMeters, c.lat)
    ring = hull.map((p) => {
      const vlat = p.lat - c.lat
      const vlng = p.lng - c.lng
      const len = Math.hypot(vlat, vlng) || 1
      return [p.lng + (vlng / len) * dLng, p.lat + (vlat / len) * dLat] as [number, number]
    })
    ring.push(ring[0])
  }

  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [ring] },
  }
}
