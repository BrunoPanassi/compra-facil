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
      :loading="inputLoading"
      hide-selected
      hide-no-data
      item-value="id"
      item-title="name"
      return-object
      clearable
      no-filter
      variant="solo-filled"
      label="Pesquise por um endereço"
      @update:model-value="pickAddress"
    >
    </v-autocomplete>
    <!-- Campo de busca com autocomplete -->

    <!-- Mapa Leaflet com marcação dos coords selecionados -->
    <MapUI :selected-coords="selectedCoords" @on-map-click="onMapClick"/>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { SearchAddress } from '~/server/services/SearchAddress';
import { useGeolocation } from '~/server/services/UserLocationService';
import { debounce } from 'lodash-es';
import { Address, Coordinates, AddressCoordinates } from '~/types/Address';

const {
  location,
  loading,
  error,
  getLocation,
  loadStoredLocation
} = useGeolocation()

const props = defineProps({
  getUserLocation: {
    type: Boolean,
    default: true
  },
  lat: {
    type: Number,
    required: false
  },
  lon: {
    type: Number,
    required: false
  },
  displayName: {
    type: String,
    required: false
  }
})

const setPropsLatitudeLongitude = () => {
  if (!!props.lat?.toString() && !!props.lon?.toString()) {
    selectedCoords.value.lat = Number.parseFloat(props.lat.toString())
    selectedCoords.value.lon = Number.parseFloat(props.lon.toString())
    selectedCoords.value.display_name = props?.displayName ?? ""
    query.value = props?.displayName ?? ""
  }
}

onMounted(async () => {
  if (props.getUserLocation) {
    // Primeiro tenta recuperar a localização salva
    const storedLocation = loadStoredLocation()

    if (storedLocation) {
      return
    }

    // Não existe localização salva.
    // Solicita permissão ao navegador.
    await getLocation()
  }

  setPropsLatitudeLongitude()
})

const loadLocation = async () => {
  await getLocation()
}

const emit = defineEmits<{
  (e: 'select', addressCoordinates: AddressCoordinates): void;
}>();

const query = ref(null) as any;
const search = ref()
const results = ref<Array<Address>>();
const selectedCoords = ref<Coordinates>({
  lat: 0,
  lon: 0,
  display_name: ''
});

let controller: AbortController | null = null;

const searchAddress = new SearchAddress();

const inputLoading = ref(false)
const onInput = debounce(async (value: string) => {
  if (!value || value.length < 3) {
    results.value = [];
    return;
  }

  try {
    inputLoading.value = true
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
        lon,
        postcode: properties.postcode,
        district: properties.district,
        street: properties.name,
        city: properties.city,
        state: properties.state
      }
    })
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      return
    }

    console.error('Erro ao buscar endereço:', error)
    results.value = []
  } finally {
    inputLoading.value = false
  }
}, 600)

function onMapClick(latLon: { lat: number, lon: number}) {
  const { lat, lon } = latLon
  if (lat && lon) {
    selectedCoords.value.lat = lat
    selectedCoords.value.lon = lon
    emit('select', {
      address: null,
      coordinates: selectedCoords.value
    });
  }
}

function pickAddress(item: Address) {
  if (item) {
    selectedCoords.value = {
      lat: Number.parseFloat(item.lat.toString()),
      lon: Number.parseFloat(item.lon.toString()),
      display_name: item.name
    };
    results.value = [];
    query.value = item.name;
    emit('select', {
      address: item,
      coordinates: selectedCoords.value
    });
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
    emit('select', {
      address: null,
      coordinates: selectedCoords.value
    });
  }
}, { immediate: true})

</script>
