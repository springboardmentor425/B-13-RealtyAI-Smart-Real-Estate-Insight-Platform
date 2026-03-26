import { useState, useEffect } from 'react'
import { satelliteService } from '../services/satelliteService'

const INITIAL_COORDS = { lat: '', lon: '', zoom: 18 }

/** Given an array of {lat, lon} markers, return the centre + a suitable zoom. */
function calcCenterAndZoom(markers) {
  if (markers.length === 1) return { lat: markers[0].lat, lon: markers[0].lon, zoom: 18 }

  const lats = markers.map(m => m.lat)
  const lons = markers.map(m => m.lon)
  const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2
  const centerLon = (Math.min(...lons) + Math.max(...lons)) / 2
  const span      = Math.max(Math.max(...lats) - Math.min(...lats), Math.max(...lons) - Math.min(...lons))

  let zoom = 18
  if      (span > 0.05)  zoom = 14
  else if (span > 0.02)  zoom = 15
  else if (span > 0.008) zoom = 16
  else if (span > 0.003) zoom = 17
  else if (span > 0.001) zoom = 18
  else                   zoom = 19

  return { lat: centerLat, lon: centerLon, zoom }
}

export function useSatellite() {
  const [mode,        setMode]        = useState('upload')   // 'upload' | 'coords' | 'map'
  const [file,        setFile]        = useState(null)
  const [previewUrl,  setPreviewUrl]  = useState(null)
  const [coords,      setCoords]      = useState(INITIAL_COORDS)
  const [mapMarkers,  setMapMarkers]  = useState([])          // [{lat, lon}, ...]
  const [prediction,  setPrediction]  = useState(null)
  const [modelInfo,   setModelInfo]   = useState(null)
  const [isLoading,   setIsLoading]   = useState(false)
  const [error,       setError]       = useState(null)

  useEffect(() => {
    satelliteService.getModelInfo().then(setModelInfo).catch(() => {})
  }, [])

  useEffect(() => {
    return () => { if (previewUrl && mode === 'upload') URL.revokeObjectURL(previewUrl) }
  }, [previewUrl, mode])

  const handleModeChange = (newMode) => {
    setMode(newMode)
    setFile(null)
    setPreviewUrl(null)
    setPrediction(null)
    setError(null)
    setCoords(INITIAL_COORDS)
    setMapMarkers([])
  }

  // ── Upload mode ───────────────────────────────────────────────
  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile)
    setPreviewUrl(URL.createObjectURL(selectedFile))
    setPrediction(null)
    setError(null)
  }

  const handleRemove = () => {
    setFile(null)
    setPreviewUrl(null)
    setPrediction(null)
    setError(null)
  }

  const handlePredict = async () => {
    if (!file) return
    setIsLoading(true)
    setError(null)
    try {
      const result = await satelliteService.predict(file)
      setPrediction(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // ── Coords mode ───────────────────────────────────────────────
  const handleCoordsChange = (field, value) =>
    setCoords(prev => ({ ...prev, [field]: value }))

  const handlePredictByCoords = async () => {
    const lat  = parseFloat(coords.lat)
    const lon  = parseFloat(coords.lon)
    const zoom = parseInt(coords.zoom)
    if (isNaN(lat) || isNaN(lon)) {
      setError('Please enter valid latitude and longitude values.')
      return
    }
    setIsLoading(true)
    setError(null)
    setPrediction(null)
    setPreviewUrl(null)
    try {
      const result = await satelliteService.predictByCoords(lat, lon, zoom)
      setPreviewUrl(`data:image/png;base64,${result.image_b64}`)
      setPrediction(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // ── Map mode ──────────────────────────────────────────────────
  const handleMapMarkerAdd = (latlng) => {
    setMapMarkers(prev => {
      if (prev.length >= 4) return prev
      return [...prev, latlng]
    })
  }

  const handleMapClear = () => {
    setMapMarkers([])
    setPrediction(null)
    setPreviewUrl(null)
    setError(null)
  }

  const handlePredictByMap = async () => {
    if (mapMarkers.length === 0) return
    const { lat, lon, zoom } = calcCenterAndZoom(mapMarkers)
    setIsLoading(true)
    setError(null)
    setPrediction(null)
    setPreviewUrl(null)
    try {
      const result = await satelliteService.predictByCoords(lat, lon, zoom)
      setPreviewUrl(`data:image/png;base64,${result.image_b64}`)
      setPrediction(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    mode, coords, file, previewUrl, prediction, modelInfo, isLoading, error,
    mapMarkers,
    handleModeChange, handleCoordsChange, handlePredictByCoords,
    handleFileSelect, handleRemove, handlePredict,
    handleMapMarkerAdd, handleMapClear, handlePredictByMap,
  }
}
