<template>
  <v-card class="p-4">
    <ProductCombobox 
      :disabled="false"
      :multiple="true"
      @on-select="onProductSelect"
      @on-clear="onProductClear"
    />

    <!-- CEP destino -->
    <v-text-field
      v-model="destinationZip"
      label="CEP de entrega"
      placeholder="Digite o CEP"
      class="mb-4"
    />

    <v-btn color="primary" @click="calculateBestStores">
      Calcular Melhor Opção
    </v-btn>

    <!-- Resultado -->
    <div v-if="bestStores.length" class="mt-6">
      <h3 class="text-md font-bold mb-2">Top 3 Lojas</h3>

      <div v-for="(store, index) in bestStores" :key="store.id" class="mb-4 p-2 border rounded">
        <h4 class="font-semibold">#{{ index + 1 }} - {{ store.store.name }}</h4>
        <p><strong>Preço total:</strong> R$ {{ store.totalPrice.toFixed(2) }}</p>
        <p><strong>Distância:</strong> {{ store.distance.toFixed(2) }} km</p>
        <p><strong>Produtos encontrados:</strong></p>
        <ul>
          <li v-for="p in store.foundProducts" :key="p.id">{{ p.name }}</li>
        </ul>
        <p v-if="store.missingProducts.length"><strong>Produtos não encontrados:</strong></p>
        <ul v-if="store.missingProducts.length">
          <li v-for="p in store.missingProducts" :key="p.id">{{ p.name }}</li>
        </ul>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import type { Product } from '~/types/Product';
import { ref } from "vue"
import { haversineDistance } from '~/util/geoUtils';

const selectedProducts = ref<Product[]>();
function onProductSelect(product: Product[]) {
  selectedProducts.value = product
}

function onProductClear() {
  selectedProducts.value = undefined
}

const storeStore = useStoreStore()
const productStoreStore = useProductStoreStore()

const destinationZip = ref("")
const bestStores = ref<any[]>([])

// Obter coordenadas via Nominatim (OpenStreetMap)
async function getCoordinatesByZip(zip: string) {
  const url = `https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=Brazil&format=json`
  const res = await fetch(url, { headers: { "User-Agent": "compra-facil-app" } })
  const data = await res.json()
  if (data.length > 0) {
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
  }
  return null
}

async function calculateBestStores() {
  const stores = await storeStore.fetch()
  const productsStore = await productStoreStore.fetch({
    prop: ''
  })

  const destinationCoords = await getCoordinatesByZip(destinationZip.value)
  if (!destinationCoords) {
    alert("CEP do destino inválido.")
    return
  }

  if (!selectedProducts.value) {
    alert("Selecione pelo menos um produto")
    return
  }

  const results:any[] = []

  for (const store of stores) {
    const storeCoords = await getCoordinatesByZip(store.zip.toString())
    if (!storeCoords) continue

    let totalPrice = 0
    const foundProducts:any[] = []
    const missingProducts:any[] = []

    for (const product of selectedProducts.value) {
      const ps = productsStore.items.find(
        (ps: any) => ps.store_id === store.id && ps.product_id === product.id
      )

      if (ps) {
        totalPrice += parseFloat(ps.price)
        foundProducts.push(product)
      } else {
        missingProducts.push(product)
      }
    }

    // Distância
    const distance = haversineDistance(
      destinationCoords.lat,
      destinationCoords.lon,
      storeCoords.lat,
      storeCoords.lon
    )

    results.push({ store, totalPrice, distance, foundProducts, missingProducts })
  }

  // Normalizar preço e distância para calcular score
  const maxPrice = Math.max(...results.map(r => r.totalPrice))
  const maxDist = Math.max(...results.map(r => r.distance))

  results.forEach(r => {
    const priceNorm = r.totalPrice / maxPrice
    const distNorm = r.distance / maxDist
    r.score = priceNorm * 0.6 + distNorm * 0.4
  })

  bestStores.value = results.sort((a, b) => a.score - b.score).slice(0, 3)
}


</script>
