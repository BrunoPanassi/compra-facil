import { defineNuxtConfig } from "nuxt/config";
import { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['@/assets/css/main.css'],
  modules: ['vuetify-nuxt-module', '@pinia/nuxt', '@nuxt/fonts', '@nuxtjs/leaflet'],
  build: {
    transpile: ['vuetify', 'lodash-es']
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  runtimeConfig: {
    useSql: process.env.PRIVATE_USE_SQL,
    openStreetMapUrl: process.env.PRIVATE_OPENSTREETMAP_URL,
    googleMapsUrl: process.env.PRIVATE_GOOGLEMAPS_URL,
    useGoogleMapsSearchAddress: process.env.PRIVATE_USE_GOOGLEMAPS_SEARCH_ADDRESS,
    public: {
      useLeafletUI: process.env.PRIVATE_USE_LEAFLET_UI,
      jsonBinBaseUrl: process.env.JSONBIN_BASE_URL
    },
    jsonBinApiKey: process.env.JSONBIN_API_KEY,
    jsonBinUsersId: process.env.JSONBIN_USERS_ID,
    jsonBinStoresId: process.env.JSONBIN_STORES_ID,
    jsonBinProductsId: process.env.JSONBIN_PRODUCTS_ID,
    jsonBinMaterialsId: process.env.JSONBIN_MATERIALS_ID,
    jsonBinMaterialTypesId: process.env.JSONBIN_MATERIAL_TYPES_ID,
    jsonBinProductStoresId: process.env.JSONBIN_PRODUCT_STORES_ID,
  }
});
