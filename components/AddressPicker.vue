<template>
  <div class="text-center">
    <v-btn prepend-icon="mdi-map-marker" @click="loadLocation" :loading="loading" class="mb-4">
      Minha localização
    </v-btn>
    <span v-if="error">{{ error }}</span>
    <v-autocomplete
      v-model="query"
      v-model:search="search"
      :items="results"
      hide-selected
      item-value="id"
      item-title="name"
      return-object
      clearable
      no-filter
      auto-select-first="exact"
      variant="solo-filled"
      label="Pesquise por um endereço"
      @update:model-value="pickAddress"
    >
    </v-autocomplete>
    <!-- Campo de busca com autocomplete -->

    <!-- Mapa Leaflet com marcação dos coords selecionados -->
    <MapUI :selected-coords="selectedCoords"/>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { SearchAddress } from '~/server/services/SearchAddress';
import { useGeolocation } from '~/server/services/UserLocationService';
import { debounce } from 'lodash-es';

const {
  location,
  loading,
  error,
  getLocation,
  loadStoredLocation
} = useGeolocation()

onMounted(async () => {

  // Primeiro tenta recuperar a localização salva
  const storedLocation = loadStoredLocation()

  if (storedLocation) {
    return
  }

  // Não existe localização salva.
  // Solicita permissão ao navegador.
  await getLocation()

})

const loadLocation = async () => {
  await getLocation()
}

const emit = defineEmits<{
  (e: 'select', coords: { lat: number; lon: number; display_name: string }): void;
}>();

interface Address {
  id: number, 
  name: string,
  lat: number,
  lon: number
}

const query = ref('') as any;
const search = ref('')
const results = ref<Array<Address>>();
const selectedCoords = ref<{ lat: number; lon: number; display_name: string }>({
  lat: 0,
  lon: 0,
  display_name: ''
});

let controller: AbortController | null = null;

const searchAddress = new SearchAddress();

const onInput = debounce(async (value: string) => {
  if (!value || value.length < 3) {
    results.value = [];
    return;
  }

  try {
    const url = await searchAddress.getUrl(value)

    const res = await $fetch(url.url, {
      headers: {
        'User-Agent': 'compra-facil-app'
      }
    })

    const { features } = res as any

    results.value = features.map((obj: any) => {
      const { geometry, properties } = obj
      const [lon, lat] = geometry.coordinates

      return {
        id: properties.osm_id,
        name: `${properties.name}, ${properties.city}, ${properties.state} - ${properties.postcode}`,
        lat,
        lon
      }
    })
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      return
    }

    console.error('Erro ao buscar endereço:', error)
    results.value = []
  }
}, 600)

function pickAddress(item: Address) {
  if (item) {
    selectedCoords.value = {
      lat: Number.parseFloat(item.lat.toString()),
      lon: Number.parseFloat(item.lon.toString()),
      display_name: item.name
    };
    results.value = [];
    query.value = item.name;
    emit('select', selectedCoords.value);
  }
}

watch(() => search.value, () => {
  onInput(search.value)
})

watch(() => location.value, () => {
  if (location.value) {
    const { latitude, longitude } = location.value
    selectedCoords.value = {
      lat: Number.parseFloat(latitude.toString()),
      lon: Number.parseFloat(longitude.toString()),
      display_name: "Atual localização"
    };
    results.value = [];
    emit('select', selectedCoords.value);
  }
}, { immediate: true})

</script>
