'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps'
import { Play, X } from 'lucide-react'
import type { Stop } from '@/lib/types'

function FitBounds({ stops, suspend }: { stops: Stop[]; suspend: boolean }) {
  const map = useMap()

  useEffect(() => {
    if (!map || stops.length === 0 || suspend) return
    if (stops.length === 1) {
      map.setCenter({ lat: stops[0].lat, lng: stops[0].lng })
      map.setZoom(10)
      return
    }
    const bounds = new google.maps.LatLngBounds()
    stops.forEach(s => bounds.extend({ lat: s.lat, lng: s.lng }))
    map.fitBounds(bounds, 64)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, stops, suspend])

  return null
}

function RouteRenderer({
  stops,
  routeKey,
  onDistanceComputed,
}: {
  stops: Stop[]
  routeKey: string
  onDistanceComputed?: (meters: number) => void
}) {
  const map = useMap()
  const routesLib = useMapsLibrary('routes')
  const rendererRef = useRef<google.maps.DirectionsRenderer | null>(null)

  useEffect(() => {
    if (!routesLib || !map || stops.length < 2) return

    if (rendererRef.current) rendererRef.current.setMap(null)

    const renderer = new routesLib.DirectionsRenderer({
      suppressMarkers: true,
      preserveViewport: true,
      polylineOptions: { strokeColor: '#4e644b', strokeWeight: 4, strokeOpacity: 0.8 },
    })
    renderer.setMap(map)
    rendererRef.current = renderer

    const service = new routesLib.DirectionsService()
    const waypoints = stops.slice(1, -1).map(s => ({
      location: { lat: s.lat, lng: s.lng },
      stopover: true,
    }))

    let cancelled = false
    service.route(
      {
        origin: { lat: stops[0].lat, lng: stops[0].lng },
        destination: { lat: stops[stops.length - 1].lat, lng: stops[stops.length - 1].lng },
        waypoints,
        travelMode: routesLib.TravelMode.DRIVING,
      },
      (result, status) => {
        if (cancelled) return
        if (status === 'OK' && result) {
          renderer.setDirections(result)
          const totalMeters = result.routes[0]?.legs.reduce((sum, leg) => sum + (leg.distance?.value ?? 0), 0) ?? 0
          onDistanceComputed?.(totalMeters)
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

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
}

function animateMapTo(map: google.maps.Map, target: { lat: number; lng: number; zoom: number }, duration: number) {
  return new Promise<void>(resolve => {
    const startCenter = map.getCenter()
    const startLat = startCenter?.lat() ?? target.lat
    const startLng = startCenter?.lng() ?? target.lng
    const startZoom = map.getZoom() ?? target.zoom
    const startTime = performance.now()

    function step(now: number) {
      const t = Math.min((now - startTime) / duration, 1)
      const eased = easeInOutQuad(t)
      map!.setCenter({
        lat: startLat + (target.lat - startLat) * eased,
        lng: startLng + (target.lng - startLng) * eased,
      })
      map!.setZoom(startZoom + (target.zoom - startZoom) * eased)
      if (t < 1) requestAnimationFrame(step)
      else resolve()
    }
    requestAnimationFrame(step)
  })
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function PlaybackController({
  stops,
  isPlaying,
  onStopChange,
  onDone,
}: {
  stops: Stop[]
  isPlaying: boolean
  onStopChange: (stop: Stop | null, index: number) => void
  onDone: () => void
}) {
  const map = useMap()

  useEffect(() => {
    if (!isPlaying || !map || stops.length === 0) return
    let cancelled = false

    async function play() {
      for (let i = 0; i < stops.length; i++) {
        if (cancelled) return
        onStopChange(stops[i], i)
        await animateMapTo(map!, { lat: stops[i].lat, lng: stops[i].lng, zoom: 11 }, 1100)
        if (cancelled) return
        await sleep(1900)
      }
      if (cancelled) return
      const bounds = new google.maps.LatLngBounds()
      stops.forEach(s => bounds.extend({ lat: s.lat, lng: s.lng }))
      map!.fitBounds(bounds, 64)
      onStopChange(null, -1)
      onDone()
    }
    play()

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, map, stops])

  return null
}

interface JourneyMapProps {
  stops: Stop[]
  className?: string
  highlightStopId?: string
  onStopClick?: (stop: Stop) => void
  onDistanceComputed?: (meters: number) => void
  stopPhotos?: Record<string, string>
  enablePlayback?: boolean
}

export function JourneyMap({
  stops,
  className,
  highlightStopId,
  onStopClick,
  onDistanceComputed,
  stopPhotos,
  enablePlayback = false,
}: JourneyMapProps) {
  const sorted = useMemo(
    () => [...stops].sort((a, b) => a.order_index - b.order_index),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stops.map(s => `${s.id}:${s.order_index}:${s.lat}:${s.lng}`).join('|')]
  )
  const routeKey = useMemo(() => sorted.map(s => s.id).join(','), [sorted])

  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackStop, setPlaybackStop] = useState<Stop | null>(null)
  const [playbackIndex, setPlaybackIndex] = useState(-1)

  const center = sorted.length > 0
    ? { lat: sorted[0].lat, lng: sorted[0].lng }
    : { lat: 39.8283, lng: -98.5795 }

  const activeHighlight = playbackStop?.id ?? highlightStopId

  const markerColor = (stop: Stop, index: number) => {
    if (stop.id === activeHighlight) return { bg: '#d4a373', border: '#a8763f' }
    if (index === 0) return { bg: '#10b981', border: '#059669' }
    if (index === sorted.length - 1) return { bg: '#ef4444', border: '#dc2626' }
    return { bg: '#4e644b', border: '#374c35' }
  }

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <div className={className}>
        <div className="relative w-full h-full">
          <Map
            defaultCenter={center}
            defaultZoom={sorted.length > 0 ? 6 : 4}
            gestureHandling="cooperative"
            disableDefaultUI
            mapId="journey-map"
            className="w-full h-full"
          >
            {sorted.map((stop, index) => {
              const { bg, border } = markerColor(stop, index)
              return (
                <AdvancedMarker
                  key={stop.id}
                  position={{ lat: stop.lat, lng: stop.lng }}
                  title={`${index + 1}. ${stop.name}`}
                  onClick={onStopClick ? () => onStopClick(stop) : undefined}
                >
                  <Pin background={bg} borderColor={border} glyphColor="white" />
                </AdvancedMarker>
              )
            })}
            <RouteRenderer stops={sorted} routeKey={routeKey} onDistanceComputed={onDistanceComputed} />
            <FitBounds stops={sorted} suspend={isPlaying} />
            {enablePlayback && (
              <PlaybackController
                stops={sorted}
                isPlaying={isPlaying}
                onStopChange={(stop, index) => { setPlaybackStop(stop); setPlaybackIndex(index) }}
                onDone={() => setIsPlaying(false)}
              />
            )}
          </Map>

          {enablePlayback && sorted.length >= 2 && (
            <div className="absolute top-3 right-3 z-10">
              {!isPlaying ? (
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  className="flex items-center gap-1.5 bg-surface-container-lowest/95 hover:bg-surface-container-lowest text-on-surface text-sm font-semibold px-3.5 py-2 rounded-full shadow-lg backdrop-blur-sm transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Relive the Journey
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsPlaying(false)}
                  className="flex items-center gap-1.5 bg-primary/90 hover:bg-primary text-on-primary text-sm font-semibold px-3.5 py-2 rounded-full shadow-lg backdrop-blur-sm transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Stop
                </button>
              )}
            </div>
          )}

          {isPlaying && playbackStop && (
            <div className="absolute top-4 inset-x-0 z-10 flex justify-center px-4 pointer-events-none">
              <div className="relative bg-surface-container-lowest rounded-2xl shadow-lg overflow-hidden pointer-events-auto w-56">
                {stopPhotos?.[playbackStop.id] && (
                  <>
                    <img src={stopPhotos[playbackStop.id]} alt="" className="absolute inset-0 w-full h-full object-cover" aria-hidden />
                    <div className="absolute inset-0 bg-surface-container-lowest/80" />
                  </>
                )}
                <div className="relative px-4 py-3 text-center">
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-0.5">
                    Stop {playbackIndex + 1} of {sorted.length}
                  </p>
                  <p className="text-sm font-serif italic text-on-surface truncate">{playbackStop.name}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </APIProvider>
  )
}
