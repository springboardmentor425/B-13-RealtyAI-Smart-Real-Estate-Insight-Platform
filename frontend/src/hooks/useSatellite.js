import { useState, useEffect } from 'react'
import { satelliteService } from '../services/satelliteService'

const INITIAL_COORDS = { lat: '', lon: '', zoom: 18 }

export function useSatellite() {
  const [mode,       setMode]       = useState('upload')   // 'upload' | 'coords'
  const [file,       setFile]       = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [coords,     setCoords]     = useState(INITIAL_COORDS)
  const [prediction, setPrediction] = useState(null)
  const [modelInfo,  setModelInfo]  = useState(null)
  const [isLoading,  setIsLoading]  = useState(false)
  const [error,      setError]      = useState(null)

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
  }

  // ── Upload mode ──────────────────────────────────────────────────
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

  // ── Coords mode ──────────────────────────────────────────────────
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
      // Use the base64 image from the API response as the preview
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
    handleModeChange, handleCoordsChange, handlePredictByCoords,
    handleFileSelect, handleRemove, handlePredict,
  }
}
