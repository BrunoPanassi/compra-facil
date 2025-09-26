<template>
    <div>
        <LeafletMap 
            v-if="useLeafletUI"
            :selected-coords="props.selectedCoords"
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

const config = useRuntimeConfig()
const useLeafletUI = config.public.useLeafletUI === 'true'

</script>

<style scoped>

</style>