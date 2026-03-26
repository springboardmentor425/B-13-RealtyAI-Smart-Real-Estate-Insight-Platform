import { useState, useEffect } from 'react'
import { predictionService } from '../services/predictionService'

const INITIAL_FORM = {
  OverallQual: '', OverallCond: '', GrLivArea: '', TotalBsmtSF: '',
  LotArea: '', GarageArea: '', WoodDeckSF: '', OpenPorchSF: '',
  FullBath: '', HalfBath: '', BedroomAbvGr: '', GarageCars: '',
  Fireplaces: '', YearBuilt: '', YearRemodAdd: '',
}

function buildPayload(formValues) {
  const payload = {}
  for (const [key, val] of Object.entries(formValues)) {
    if (val !== '') payload[key] = Number(val)
  }
  return payload
}

export function usePrediction() {
  const [formValues, setFormValues] = useState(INITIAL_FORM)
  const [prediction, setPrediction] = useState(null)
  const [modelInfo,  setModelInfo]  = useState(null)
  const [isLoading,  setIsLoading]  = useState(false)
  const [error,      setError]      = useState(null)

  useEffect(() => {
    predictionService.getModelInfo().then(setModelInfo).catch(() => {})
  }, [])

  const handleChange = (name, value) =>
    setFormValues(prev => ({ ...prev, [name]: value }))

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await predictionService.predict(buildPayload(formValues))
      setPrediction(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setFormValues(INITIAL_FORM)
    setPrediction(null)
    setError(null)
  }

  return { formValues, prediction, modelInfo, isLoading, error, handleChange, handleSubmit, handleReset }
}
