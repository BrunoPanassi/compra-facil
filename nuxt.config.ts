import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['@/assets/css/main.css'],
  modules: ['vuetify-nuxt-module', '@pinia/nuxt', '@nuxt/fonts', '@nuxtjs/leaflet']
});
