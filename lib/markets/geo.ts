// Utility geometriche pure (niente dipendenze): distanza haversine per
// l'ordinamento "più vicino a me" e per i comuni limitrofi.

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
