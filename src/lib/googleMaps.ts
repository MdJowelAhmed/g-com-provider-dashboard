const DEFAULT_CENTER = { lat: 23.8103, lng: 90.4125 }

let loadPromise: Promise<typeof google> | null = null

export function getGoogleMapsApiKey() {
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() ?? ''
}

export function loadGoogleMaps(): Promise<typeof google> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps is only available in the browser'))
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google)
  }

  if (loadPromise) return loadPromise

  const apiKey = getGoogleMapsApiKey()
  if (!apiKey) {
    return Promise.reject(new Error('Missing VITE_GOOGLE_MAPS_API_KEY'))
  }

  loadPromise = new Promise((resolve, reject) => {
    const scriptId = 'google-maps-script'
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null

    const handleLoad = () => {
      if (window.google?.maps) {
        resolve(window.google)
        return
      }
      reject(new Error('Google Maps failed to initialize'))
    }

    if (existing) {
      existing.addEventListener('load', handleLoad, { once: true })
      existing.addEventListener('error', () => reject(new Error('Google Maps script failed to load')), {
        once: true,
      })
      return
    }

    const script = document.createElement('script')
    script.id = scriptId
    script.async = true
    script.defer = true
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`
    script.onload = handleLoad
    script.onerror = () => reject(new Error('Google Maps script failed to load'))
    document.head.appendChild(script)
  })

  return loadPromise
}

export function parseCoordinate(value: string | number | null | undefined) {
  if (value == null || value === '') return null
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

export function getDefaultMapCenter() {
  return DEFAULT_CENTER
}

export function locationNameFromGeocoder(
  result: google.maps.GeocoderResult,
  fallback = '',
) {
  const preferredTypes = [
    'establishment',
    'point_of_interest',
    'premise',
    'neighborhood',
    'sublocality',
    'sublocality_level_1',
    'locality',
    'administrative_area_level_2',
    'route',
  ]

  for (const type of preferredTypes) {
    const component = result.address_components?.find((item) => item.types.includes(type))
    if (component?.long_name?.trim()) return component.long_name.trim()
  }

  const firstPart = result.formatted_address?.split(',')[0]?.trim()
  if (firstPart) return firstPart

  return fallback.trim()
}

export function resolvePlaceName(place: google.maps.places.PlaceResult, typed = '') {
  if (place.name?.trim()) return place.name.trim()
  if (typed.trim()) return typed.trim()
  const firstPart = place.formatted_address?.split(',')[0]?.trim()
  if (firstPart) return firstPart
  return place.vicinity?.trim() || ''
}

export async function geocodeAddressQuery(query: string): Promise<{
  locationName: string
  latitude: number
  longitude: number
} | null> {
  const trimmed = query.trim()
  if (!trimmed) return null

  const googleMaps = await loadGoogleMaps()
  const geocoder = new googleMaps.maps.Geocoder()

  return new Promise((resolve) => {
    geocoder.geocode({ address: trimmed }, (results, status) => {
      if (status !== 'OK' || !results?.[0]?.geometry?.location) {
        resolve(null)
        return
      }

      const location = results[0].geometry.location
      resolve({
        locationName: locationNameFromGeocoder(results[0], trimmed),
        latitude: location.lat(),
        longitude: location.lng(),
      })
    })
  })
}
