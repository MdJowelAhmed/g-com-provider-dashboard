import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Alert } from 'antd'
import {
  geocodeAddressQuery,
  getDefaultMapCenter,
  loadGoogleMaps,
  locationNameFromGeocoder,
  parseCoordinate,
  resolvePlaceName,
} from '../../lib/googleMaps'

export type MapLocationValue = {
  locationName: string
  latitude: number | null
  longitude: number | null
}

export type GoogleMapLocationPickerRef = {
  getInputValue: () => string
  resolveLocation: () => Promise<{
    locationName: string
    latitude: number
    longitude: number
  } | null>
}

type Props = {
  value?: MapLocationValue
  onChange?: (value: MapLocationValue & { latitude: number; longitude: number }) => void
  onNameChange?: (locationName: string) => void
  disabled?: boolean
}

function isCoordinateLike(value: string) {
  return /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(value.trim())
}

const GoogleMapLocationPicker = forwardRef<GoogleMapLocationPickerRef, Props>(
  function GoogleMapLocationPicker({ value, onChange, onNameChange, disabled }, ref) {
    const inputRef = useRef<HTMLInputElement>(null)
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<google.maps.Map | null>(null)
    const markerRef = useRef<google.maps.Marker | null>(null)
    const geocoderRef = useRef<google.maps.Geocoder | null>(null)
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
    const onChangeRef = useRef(onChange)
    const onNameChangeRef = useRef(onNameChange)
    const valueRef = useRef(value)

    const [loadError, setLoadError] = useState<string | null>(null)
    const [ready, setReady] = useState(false)

    onChangeRef.current = onChange
    onNameChangeRef.current = onNameChange
    valueRef.current = value

    useImperativeHandle(ref, () => ({
      getInputValue: () => inputRef.current?.value?.trim() ?? '',
      resolveLocation: async () => {
        const query = inputRef.current?.value?.trim() ?? valueRef.current?.locationName?.trim() ?? ''
        if (!query) return null

        const lat = parseCoordinate(valueRef.current?.latitude ?? null)
        const lng = parseCoordinate(valueRef.current?.longitude ?? null)
        const name = isCoordinateLike(query) ? valueRef.current?.locationName?.trim() || '' : query

        if (lat != null && lng != null && name) {
          return { locationName: name, latitude: lat, longitude: lng }
        }

        return geocodeAddressQuery(query)
      },
    }))

    useEffect(() => {
      let cancelled = false

      const init = async () => {
        try {
          const googleMaps = await loadGoogleMaps()
          if (cancelled || !inputRef.current || !mapRef.current) return

          const lat = parseCoordinate(valueRef.current?.latitude ?? null)
          const lng = parseCoordinate(valueRef.current?.longitude ?? null)
          const center = lat != null && lng != null ? { lat, lng } : getDefaultMapCenter()

          const map = new googleMaps.maps.Map(mapRef.current, {
            center,
            zoom: lat != null && lng != null ? 15 : 12,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          })
          mapInstanceRef.current = map

          const marker = new googleMaps.maps.Marker({
            map,
            position: center,
            draggable: !disabled,
          })
          markerRef.current = marker

          const geocoder = new googleMaps.maps.Geocoder()
          geocoderRef.current = geocoder

          const applyLocation = (next: {
            locationName: string
            latitude: number
            longitude: number
          }) => {
            const locationName = isCoordinateLike(next.locationName)
              ? valueRef.current?.locationName?.trim() || inputRef.current?.value?.trim() || ''
              : next.locationName.trim()

            if (inputRef.current) inputRef.current.value = locationName
            onNameChangeRef.current?.(locationName)
            onChangeRef.current?.({ ...next, locationName })
          }

          const geocodeAddress = (address: string) => {
            const query = address.trim()
            if (!query) return

            geocoder.geocode({ address: query }, (results, status) => {
              if (status !== 'OK' || !results?.[0]?.geometry?.location) return

              const location = results[0].geometry.location
              const latitude = location.lat()
              const longitude = location.lng()
              const locationName = locationNameFromGeocoder(results[0], query)

              marker.setPosition({ lat: latitude, lng: longitude })
              map.panTo({ lat: latitude, lng: longitude })
              map.setZoom(15)
              applyLocation({ locationName, latitude, longitude })
            })
          }

          const reverseGeocode = (latitude: number, longitude: number) => {
            geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
              if (status !== 'OK' || !results?.[0]) {
                applyLocation({
                  locationName: inputRef.current?.value?.trim() || valueRef.current?.locationName?.trim() || '',
                  latitude,
                  longitude,
                })
                return
              }

              applyLocation({
                locationName: locationNameFromGeocoder(
                  results[0],
                  inputRef.current?.value?.trim() || valueRef.current?.locationName || '',
                ),
                latitude,
                longitude,
              })
            })
          }

          const autocomplete = new googleMaps.maps.places.Autocomplete(inputRef.current, {
            fields: ['name', 'formatted_address', 'geometry', 'vicinity'],
            types: ['geocode', 'establishment'],
          })
          autocomplete.bindTo('bounds', map)
          autocompleteRef.current = autocomplete

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace()
            const location = place.geometry?.location
            const typed = inputRef.current?.value ?? ''

            if (!location) {
              geocodeAddress(typed)
              return
            }

            const latitude = location.lat()
            const longitude = location.lng()
            const locationName = resolvePlaceName(place, typed)

            marker.setPosition({ lat: latitude, lng: longitude })
            map.panTo({ lat: latitude, lng: longitude })
            map.setZoom(15)
            applyLocation({ locationName, latitude, longitude })
          })

          const handleEnter = (event: KeyboardEvent) => {
            if (event.key !== 'Enter') return
            event.preventDefault()
            geocodeAddress(inputRef.current?.value ?? '')
          }

          const handleBlur = () => {
            const typed = inputRef.current?.value?.trim() ?? ''
            if (!typed) return
            onNameChangeRef.current?.(typed)

            const lat = parseCoordinate(valueRef.current?.latitude ?? null)
            const lng = parseCoordinate(valueRef.current?.longitude ?? null)
            if (lat == null || lng == null) {
              geocodeAddress(typed)
            }
          }

          const handleInput = () => {
            onNameChangeRef.current?.(inputRef.current?.value ?? '')
          }

          inputRef.current.addEventListener('keydown', handleEnter)
          inputRef.current.addEventListener('blur', handleBlur)
          inputRef.current.addEventListener('input', handleInput)

          marker.addListener('dragend', () => {
            const position = marker.getPosition()
            if (!position) return
            reverseGeocode(position.lat(), position.lng())
          })

          map.addListener('click', (event: google.maps.MapMouseEvent) => {
            if (disabled || !event.latLng) return
            marker.setPosition(event.latLng)
            reverseGeocode(event.latLng.lat(), event.latLng.lng())
          })

          if (valueRef.current?.locationName && !isCoordinateLike(valueRef.current.locationName)) {
            inputRef.current.value = valueRef.current.locationName
          }

          setReady(true)

          return () => {
            inputRef.current?.removeEventListener('keydown', handleEnter)
            inputRef.current?.removeEventListener('blur', handleBlur)
            inputRef.current?.removeEventListener('input', handleInput)
          }
        } catch (error) {
          if (!cancelled) {
            setLoadError(error instanceof Error ? error.message : 'Failed to load Google Maps')
          }
        }
      }

      let cleanupInput: (() => void) | undefined
      void init().then((cleanup) => {
        cleanupInput = cleanup
      })

      return () => {
        cancelled = true
        cleanupInput?.()
        autocompleteRef.current = null
        markerRef.current = null
        mapInstanceRef.current = null
        geocoderRef.current = null
        setReady(false)
      }
    }, [disabled])

    useEffect(() => {
      if (!ready || !inputRef.current) return

      const lat = parseCoordinate(value?.latitude ?? null)
      const lng = parseCoordinate(value?.longitude ?? null)

      if (value?.locationName && !isCoordinateLike(value.locationName)) {
        inputRef.current.value = value.locationName
      }

      if (lat == null || lng == null) return

      const map = mapInstanceRef.current
      const marker = markerRef.current
      if (!map || !marker) return

      const position = { lat, lng }
      marker.setPosition(position)
      map.panTo(position)
    }, [ready, value?.latitude, value?.longitude, value?.locationName])

    if (loadError) {
      return (
        <Alert
          type="warning"
          showIcon
          message="Google Maps unavailable"
          description={loadError}
        />
      )
    }

    return (
      <div className="space-y-3">
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          defaultValue={value?.locationName ?? ''}
          placeholder="e.g. Gulshan, Banani, Dhanmondi"
          className="h-10 w-full rounded-md border border-surface-border bg-surface-card px-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-brand focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        />
        <div
          ref={mapRef}
          className="h-56 w-full overflow-hidden rounded-lg border border-surface-border bg-surface-elevated"
        />
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border border-surface-border bg-surface-elevated px-3 py-2">
            <div className="text-[11px] uppercase tracking-wide text-gray-500">Latitude</div>
            <div className="mt-0.5 font-mono text-sm text-gray-200">
              {value?.latitude != null ? Number(value.latitude).toFixed(6) : '—'}
            </div>
          </div>
          <div className="rounded-md border border-surface-border bg-surface-elevated px-3 py-2">
            <div className="text-[11px] uppercase tracking-wide text-gray-500">Longitude</div>
            <div className="mt-0.5 font-mono text-sm text-gray-200">
              {value?.longitude != null ? Number(value.longitude).toFixed(6) : '—'}
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Type a place name, pick a suggestion, press Enter, or click the map.
        </div>
      </div>
    )
  },
)

export default GoogleMapLocationPicker
