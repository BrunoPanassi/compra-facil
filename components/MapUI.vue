<template>
    <div>
        <LeafletMap 
            v-if="useLeafletUI"
            :selected-coords="props.selectedCoords"
            @on-map-click="launchEmitOnMapClick"
        />
    </div>
</template>

<script setup lang="ts">
import type { SelectedCoords } from '~/types/SearchAddress';
import LeafletMap from './LeafletMap.vue';

interface Props {
    selectedCoords: SelectedCoords
}

const props = defineProps<Props>()
const emit = defineEmits(["onMapClick"])

const launchEmitOnMapClick = (latLon: { lat: number, lon: number}) => {
    emit("onMapClick", latLon)
}

const config = useRuntimeConfig()
const useLeafletUI = config.public.useLeafletUI === 'true'

</script>

<style scoped>

</style>