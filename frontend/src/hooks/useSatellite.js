import { useState, useEffect } from 'react'
import { satelliteService } from '../services/satelliteService'

export function useSatellite() {
  const [file,       setFile]       = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [modelInfo,  setModelInfo]  = useState(null)
  const [isLoading,  setIsLoading]  = useState(false)
  const [error,      setError]      = useState(null)

  useEffect(() => {
    satelliteService.getModelInfo().then(setModelInfo).catch(() => {})
  }, [])

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }
  }, [previewUrl])

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

  return { file, previewUrl, prediction, modelInfo, isLoading, error,
           handleFileSelect, handleRemove, handlePredict }
}
