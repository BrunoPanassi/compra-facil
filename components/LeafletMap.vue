<template>
    <LMap
      v-if="props.selectedCoords"
      ref="lmapRef"
      :center="[props.selectedCoords.lat, props.selectedCoords.lon]"
      :zoom="14"
      style="height: 300px; margin-top: 12px"
      :use-global-leaflet="false"
      @click="onMapClick"
      @mousedown="onMapClick"
    >
      <LTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <LMarker :lat-lng="[latitude, longitude]" />
    </LMap>
</template>

<script setup lang="ts">
import type { SelectedCoords } from '~/types/SearchAddress';


interface Props {
    selectedCoords: SelectedCoords
}

const props = defineProps<Props>()

const latitude = ref()
const longitude = ref()

watch(
  () => props.selectedCoords,
  (val) => {
    latitude.value = val.lat
    longitude.value = val.lon
  }, { immediate: true}
)

function onMapClick(e: any) {
  const { lat, lng} = e.latlng
  latitude.value = lat
  longitude.value = lng
}

</script>

<style scoped>

</style>