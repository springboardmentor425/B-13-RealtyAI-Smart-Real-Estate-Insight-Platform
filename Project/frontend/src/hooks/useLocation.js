import { useState, useRef, useCallback } from 'react'
import { locationService } from '../services/locationService'
import { satelliteService } from '../services/satelliteService'

export function useLocation() {
  const [query,           setQuery]           = useState('')
  const [suggestions,     setSuggestions]     = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [areas,           setAreas]           = useState([])
  const [selectedArea,    setSelectedArea]    = useState(null)
  const [amenities,       setAmenities]       = useState(null)
  const [amenityCounts,   setAmenityCounts]   = useState({})
  const [amenityRadius,   setAmenityRadius]   = useState(2000)
  const [prediction,      setPrediction]      = useState(null)
  const [previewUrl,      setPreviewUrl]      = useState(null)
  const [isSearching,     setIsSearching]     = useState(false)
  const [isLoadingAreas,  setIsLoadingAreas]  = useState(false)
  const [isLoadingAmenities, setIsLoadingAmenities] = useState(false)
  const [isPredicting,    setIsPredicting]    = useState(false)
  const [error,           setError]           = useState(null)
  const debounceRef = useRef(null)

  const handleQueryChange = useCallback((value) => {
    setQuery(value)
    setShowSuggestions(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.length < 2) { setSuggestions([]); return }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const data = await locationService.search(value)
        setSuggestions(data.results)
      } catch {
        setSuggestions([])
      } finally {
        setIsSearching(false)
      }
    }, 400)
  }, [])

  const fetchAreas = useCallback(async (lat, lon, name) => {
    setIsLoadingAreas(true)
    setAreas([])
    setSelectedArea(null)
    setAmenities(null)
    setPrediction(null)
    setPreviewUrl(null)
    setError(null)
    try {
      const data = await locationService.getResidentialAreas(lat, lon, 5, name)
      setAreas(data.areas)
      setSelectedLocation({ name: data.location_name, lat, lon })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoadingAreas(false)
    }
  }, [])

  const handleSelectSuggestion = useCallback((suggestion) => {
    setQuery(suggestion.name)
    setShowSuggestions(false)
    setSuggestions([])
    fetchAreas(suggestion.lat, suggestion.lon, suggestion.name)
  }, [fetchAreas])

  const handleNearMe = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }
    setIsLoadingAreas(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setQuery('Near me')
        fetchAreas(latitude, longitude, 'My Location')
      },
      () => {
        setIsLoadingAreas(false)
        setError('Could not get your location. Please allow location access and try again.')
      }
    )
  }, [fetchAreas])

  const fetchAmenities = useCallback(async (lat, lon, radius) => {
    setIsLoadingAmenities(true)
    setAmenities(null)
    try {
      const data = await locationService.getAmenities(lat, lon, radius)
      setAmenities(data.amenities)
      setAmenityCounts(data.counts)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoadingAmenities(false)
    }
  }, [])

  const handleSelectArea = useCallback((area) => {
    setSelectedArea(area)
    setPrediction(null)
    setPreviewUrl(null)
    fetchAmenities(area.lat, area.lon, amenityRadius)
  }, [amenityRadius, fetchAmenities])

  const handleRadiusChange = useCallback((radius) => {
    setAmenityRadius(radius)
    if (selectedArea) fetchAmenities(selectedArea.lat, selectedArea.lon, radius)
  }, [selectedArea, fetchAmenities])

  const handlePredict = useCallback(async (area) => {
    setIsPredicting(true)
    setPrediction(null)
    setPreviewUrl(null)
    try {
      const result = await satelliteService.predictByCoords(area.lat, area.lon, area.zoom)
      setPreviewUrl(`data:image/png;base64,${result.image_b64}`)
      setPrediction(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsPredicting(false)
    }
  }, [])

  return {
    query, suggestions, showSuggestions, selectedLocation,
    areas, selectedArea, amenities, amenityCounts, amenityRadius,
    prediction, previewUrl,
    isSearching, isLoadingAreas, isLoadingAmenities, isPredicting, error,
    handleQueryChange, handleSelectSuggestion, handleNearMe,
    handleSelectArea, handleRadiusChange, handlePredict,
    setShowSuggestions, setError,
  }
}
