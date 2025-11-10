// server/api/helpers/serverConfig.ts

// Cache local (singleton) para não chamar `useRuntimeConfig` múltiplas vezes

/**
 * Fornece acesso seguro ao runtimeConfig do Nuxt, 
 * mesmo fora do contexto direto do server handler.
 */
export function getServerConfig() {
  return {
    useSql: process.env.PRIVATE_USE_SQL,
    openStreetMapUrl: process.env.PRIVATE_OPENSTREETMAP_URL,
    googleMapsUrl: process.env.PRIVATE_GOOGLEMAPS_URL,
    useGoogleMapsSearchAddress: process.env.PRIVATE_USE_GOOGLEMAPS_SEARCH_ADDRESS,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    public: {
      useLeafletUI: process.env.PRIVATE_USE_LEAFLET_UI,
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
    },
  }
}