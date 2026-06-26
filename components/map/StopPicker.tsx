'use client'

import { useEffect, useRef } from 'react'
import {
  Map,
  AdvancedMarker,
  Pin,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps'
import { ChevronUp, ChevronDown, X } from 'lucide-react'
import { PlacesAutocompleteInput } from './PlacesAutocompleteInput'
import type { NewStop } from '@/lib/types'

function RoutePreview({ stops }: { stops: NewStop[] }) {
  const map = useMap()
  const routesLib = useMapsLibrary('routes')
  const rendererRef = useRef<google.maps.DirectionsRenderer | null>(null)
  const routeKey = stops.map(s => `${s.lat},${s.lng}`).join('|')

  useEffect(() => {
    if (!map) return
    if (stops.length === 1) {
      map.setCenter({ lat: stops[0].lat, lng: stops[0].lng })
      map.setZoom(10)
    } else if (stops.length > 1) {
      const bounds = new google.maps.LatLngBounds()
      stops.forEach(s => bounds.extend({ lat: s.lat, lng: s.lng }))
      map.fitBounds(bounds, 32)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, routeKey])

  useEffect(() => {
    if (!routesLib || !map) return
    if (rendererRef.current) rendererRef.current.setMap(null)
    if (stops.length < 2) return

    const renderer = new routesLib.DirectionsRenderer({
      suppressMarkers: true,
      preserveViewport: true,
      polylineOptions: { strokeColor: '#4e644b', strokeWeight: 4, strokeOpacity: 0.8 },
    })
    renderer.setMap(map)
    rendererRef.current = renderer

    const service = new routesLib.DirectionsService()
    let cancelled = false
    service.route(
      {
        origin: { lat: stops[0].lat, lng: stops[0].lng },
        destination: { lat: stops[stops.length - 1].lat, lng: stops[stops.length - 1].lng },
        waypoints: stops.slice(1, -1).map(s => ({ location: { lat: s.lat, lng: s.lng }, stopover: true })),
        travelMode: routesLib.TravelMode.DRIVING,
      },
      (result, status) => {
        if (cancelled) return
        if (status === 'OK' && result) {
          renderer.setDirections(result)
        } else {
          console.error('Directions request failed:', status, result)
        }
      }
    )

    return () => {
      cancelled = true
      renderer.setMap(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, routesLib, routeKey])

  return null
}

/** Full-bleed live map — meant to fill an absolutely-positioned background container. */
export function StopMapBackground({ stops }: { stops: NewStop[] }) {
  const center = stops.length > 0
    ? { lat: stops[0].lat, lng: stops[0].lng }
    : { lat: 39.8283, lng: -98.5795 }

  return (
    <Map
      defaultCenter={center}
      defaultZoom={stops.length > 0 ? 5 : 4}
      gestureHandling="greedy"
      disableDefaultUI
      zoomControl
      mapId="stop-picker-map"
      className="w-full h-full"
    >
      {stops.map((stop, i) => (
        <AdvancedMarker key={i} position={{ lat: stop.lat, lng: stop.lng }} title={stop.name}>
          <Pin
            background={i === 0 ? '#10b981' : i === stops.length - 1 ? '#ef4444' : '#4e644b'}
            borderColor={i === 0 ? '#059669' : i === stops.length - 1 ? '#dc2626' : '#374c35'}
            glyphColor="white"
          />
        </AdvancedMarker>
      ))}
      <RoutePreview stops={stops} />
    </Map>
  )
}

interface StopControlsProps {
  stops: NewStop[]
  onChange: (stops: NewStop[]) => void
}

/** Search + editable ordered stop list — meant to live inside a floating panel above StopMapBackground. */
export function StopControls({ stops, onChange }: StopControlsProps) {
  const addStop = (stop: NewStop) => onChange([...stops, stop])
  const removeStop = (i: number) => onChange(stops.filter((_, idx) => idx !== i))
  const moveUp = (i: number) => {
    if (i === 0) return
    const next = [...stops]
    ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
    onChange(next)
  }
  const moveDown = (i: number) => {
    if (i === stops.length - 1) return
    const next = [...stops]
    ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
    onChange(next)
  }

  const stopColor = (i: number) => {
    if (i === 0) return 'bg-emerald-500'
    if (i === stops.length - 1) return 'bg-red-500'
    return 'bg-secondary'
  }

  return (
    <div className="space-y-3">
      <PlacesAutocompleteInput onSelect={addStop} placeholder="Search for a city, landmark, or address..." />

      {stops.length > 0 && (
        <ul className="space-y-1.5">
          {stops.map((stop, i) => (
            <li
              key={i}
              className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-sm"
            >
              <span className={`w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0 ${stopColor(i)}`}>
                {i + 1}
              </span>
              <span className="flex-1 truncate text-on-surface">{stop.name}</span>
              <div className="flex items-center gap-0.5 shrink-0">
                <button type="button" onClick={() => moveUp(i)} disabled={i === 0} className="p-1 hover:bg-surface-container-low rounded disabled:opacity-30 text-on-surface-variant">
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => moveDown(i)} disabled={i === stops.length - 1} className="p-1 hover:bg-surface-container-low rounded disabled:opacity-30 text-on-surface-variant">
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => removeStop(i)} className="p-1 hover:bg-red-50 text-on-surface-variant hover:text-red-500 rounded">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
