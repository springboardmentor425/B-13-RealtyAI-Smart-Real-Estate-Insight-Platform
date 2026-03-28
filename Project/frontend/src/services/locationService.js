import { api } from './api'

export const locationService = {
  search: (q) =>
    api.get(`/v1/location/search?q=${encodeURIComponent(q)}`),

  getResidentialAreas: (lat, lon, radiusKm = 5, locationName = '') =>
    api.get(
      `/v1/location/residential?lat=${lat}&lon=${lon}&radius_km=${radiusKm}&location_name=${encodeURIComponent(locationName)}`
    ),

  getAmenities: (lat, lon, radiusM = 2000) =>
    api.get(`/v1/location/amenities?lat=${lat}&lon=${lon}&radius_m=${radiusM}`),
}
