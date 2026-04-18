import type { Feature, Polygon } from 'geojson'

/**
 * Convert a GeoJSON Feature<Polygon> (outer ring only) into the
 * `google.maps.LatLngLiteral[]` path expected by @react-google-maps/api <Polygon>.
 * Returns [] if the feature is missing or malformed.
 */
export function geojsonToGoogleMapsPath(
  feature: Feature<Polygon> | null | undefined
): google.maps.LatLngLiteral[] {
  if (!feature || feature.geometry?.type !== 'Polygon') return []
  const ring = feature.geometry.coordinates?.[0]
  if (!Array.isArray(ring)) return []
  return ring
    .map(([lng, lat]) => ({ lat: Number(lat), lng: Number(lng) }))
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
}
