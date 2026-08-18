export interface UserLocation {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

const STORAGE_KEY = 'user-location'

export const useGeolocation = () => {

  const location = useState<UserLocation | null>(
    'user-location',
    () => null
  )

  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Solicita a localização atual do usuário.
   */
  const requestLocation = (): Promise<UserLocation> => {

    return new Promise((resolve, reject) => {

      if (!import.meta.client) {
        reject(new Error('Geolocation só está disponível no navegador.'))
        return
      }

      if (!navigator.geolocation) {
        reject(
          new Error(
            'Seu navegador não suporta geolocalização.'
          )
        )
        return
      }

      navigator.geolocation.getCurrentPosition(

        (position) => {

          const userLocation: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          }

          resolve(userLocation)
        },

        (positionError) => {

          reject(new Error(positionError.message))
        },

        {
          enableHighAccuracy: true,

          // Máximo de 10 segundos esperando a posição
          timeout: 10000,

          // Aceita uma localização de até 5 minutos atrás
          maximumAge: 5 * 60 * 1000
        }
      )
    })
  }

  /**
   * Solicita a localização e salva no localStorage.
   */
  const getLocation = async () => {

    loading.value = true
    error.value = null

    try {

      const currentLocation = await requestLocation()

      location.value = currentLocation

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(currentLocation)
      )

      return currentLocation

    } catch (err: any) {

      error.value = getGeolocationError(err)

      return null

    } finally {

      loading.value = false
    }
  }

  /**
   * Recupera a última localização salva.
   */
  const loadStoredLocation = () => {

    if (!import.meta.client) {
      return null
    }

    const stored = localStorage.getItem(STORAGE_KEY)

    if (!stored) {
      return null
    }

    try {

      const parsed = JSON.parse(stored) as UserLocation

      location.value = parsed

      return parsed

    } catch {

      localStorage.removeItem(STORAGE_KEY)

      return null
    }
  }

  const getGeolocationError = (error: GeolocationPositionError) => {

  switch (error.code) {

    case error.PERMISSION_DENIED:
      return 'Você não permitiu o acesso à sua localização.'

    case error.POSITION_UNAVAILABLE:
      return 'Não foi possível determinar sua localização.'

    case error.TIMEOUT:
      return 'A tentativa de obter sua localização expirou.'

    default:
      return 'Não foi possível obter sua localização.'
  }
}

  return {
    location,
    loading,
    error,
    getLocation,
    loadStoredLocation
  }
}