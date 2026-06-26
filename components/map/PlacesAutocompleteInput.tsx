'use client'

import { useEffect, useRef } from 'react'
import { useMapsLibrary } from '@vis.gl/react-google-maps'

interface PlacesAutocompleteInputProps {
  onSelect: (place: { name: string; lat: number; lng: number }) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

export function PlacesAutocompleteInput({ onSelect, placeholder, className, autoFocus }: PlacesAutocompleteInputProps) {
  const placesLib = useMapsLibrary('places')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!placesLib || !inputRef.current) return
    const autocomplete = new placesLib.Autocomplete(inputRef.current, {
      fields: ['name', 'geometry', 'formatted_address'],
    })
    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (place.geometry?.location) {
        onSelect({
          name: place.name || place.formatted_address || '',
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        })
        if (inputRef.current) inputRef.current.value = ''
      }
    })
    return () => google.maps.event.removeListener(listener)
  }, [placesLib, onSelect])

  return (
    <input
      ref={inputRef}
      autoFocus={autoFocus}
      className={className ?? 'w-full border border-outline-variant/40 rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary bg-surface-container-lowest'}
      placeholder={placeholder ?? 'Search for a place...'}
    />
  )
}
