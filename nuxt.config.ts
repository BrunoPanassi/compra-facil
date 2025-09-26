import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['@/assets/css/main.css'],
  modules: ['vuetify-nuxt-module', '@pinia/nuxt', '@nuxt/fonts', '@nuxtjs/leaflet'],
  runtimeConfig: {
    useSql: process.env.PRIVATE_USE_SQL,
    openStreetMapUrl: process.env.PRIVATE_OPENSTREETMAP_URL,
    googleMapsUrl: process.env.PRIVATE_GOOGLEMAPS_URL,
    useGoogleMapsSearchAddress: process.env.PRIVATE_USE_GOOGLEMAPS_SEARCH_ADDRESS,
    public: {
      useLeafletUI: process.env.PRIVATE_USE_LEAFLET_UI
    }
  }
});
