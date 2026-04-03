import { api } from './api'

export const predictionService = {
  predict:      (features)  => api.post('/v1/predictions/predict', features),
  getModelInfo: ()          => api.get('/v1/predictions/model-info'),
  getHealth:    ()          => api.get('/v1/predictions/health'),
}
