<template>
  <div>
    <!-- Campo de busca com autocomplete -->
    <input
      v-model="query"
      @input="onInput"
      placeholder="Digite logradouro, CEP ou número"
      class="border rounded p-2 w-full mb-2"
    />
    <ul v-if="results.length" class="border bg-white rounded shadow">
      <li
        v-for="res in results"
        :key="res.place_id"
        @click="select(res)"
        class="p-2 hover:bg-gray-100 cursor-pointer"
      >
        {{ res.display_name }}
      </li>
    </ul>

    <!-- Mapa Leaflet com marcação dos coords selecionados -->
    <MapUI :selected-coords="selectedCoords"/>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { type NominatimResponse} from 'nominatim-browser';
import { SearchAddress } from '~/server/services/SearchAddress';

const emit = defineEmits<{
  (e: 'select', coords: { lat: number; lon: number; display_name: string }): void;
}>();

const query = ref('');
const results = ref<NominatimResponse[]>([]);
const selectedCoords = ref<{ lat: number; lon: number; display_name: string }>({
  lat: 0,
  lon: 0,
  display_name: ''
});

let controller: AbortController | null = null;

const searchAddress = new SearchAddress();

async function onInput() {
  if (!query.value || query.value.length < 3) {
    results.value = [];
    return;
  }

  // Cancelar requisição anterior
  controller?.abort();
  controller = new AbortController();

  const url = await searchAddress.getUrl(query.value);

  const res = await fetch(url.url, { signal: controller.signal, headers: { 'User-Agent': 'compra-facil-app' } });
  results.value = await res.json();
}

function select(place: NominatimResponse) {
  selectedCoords.value = {
    lat: parseFloat(place.lat),
    lon: parseFloat(place.lon),
    display_name: place.display_name
  };
  results.value = [];
  query.value = place.display_name;
  emit('select', selectedCoords.value);
}

</script>
