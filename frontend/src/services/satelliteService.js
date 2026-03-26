import { api } from './api'

export const satelliteService = {
  predict: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.postForm('/v1/satellite/predict', fd)
  },
  getModelInfo: () => api.get('/v1/satellite/model-info'),
  getHealth:    () => api.get('/v1/satellite/health'),
}
