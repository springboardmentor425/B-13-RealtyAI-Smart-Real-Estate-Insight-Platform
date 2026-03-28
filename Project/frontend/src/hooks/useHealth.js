import { useState, useEffect } from 'react'
import { predictionService } from '../services/predictionService'
import { satelliteService } from '../services/satelliteService'

export function useHealth() {
  const [structuredHealth, setStructuredHealth] = useState(null)
  const [satelliteHealth,  setSatelliteHealth]  = useState(null)

  useEffect(() => {
    const poll = async () => {
      const [s, sat] = await Promise.allSettled([
        predictionService.getHealth(),
        satelliteService.getHealth(),
      ])
      setStructuredHealth(s.status   === 'fulfilled' ? s.value   : { status: 'error' })
      setSatelliteHealth( sat.status === 'fulfilled' ? sat.value : { status: 'error' })
    }

    poll()
    const id = setInterval(poll, 30_000)
    return () => clearInterval(id)
  }, [])

  return { structuredHealth, satelliteHealth }
}
