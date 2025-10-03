<template>
  <v-card class="p-4 background-primary">
    <ProductCombobox 
      :disabled="false"
      :multiple="true"
      @on-select="onProductSelect"
      @on-clear="onProductClear"
    />

    <v-expansion-panels v-model="panel">
      <v-expansion-panel title="Destino">
        <v-expansion-panel-text>
          <AddressPicker @select="onDestinationSelect" />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-card>
      <p class="ml-6 mt-2">Priorizar por:</p>
      <v-card-text>
        <v-btn-toggle
          class="d-flex justify-center"
          color="#2d6a4f"
          v-model="priorize"
          border
          mandatory
        >
          <v-btn prepend-icon="mdi-currency-usd" value="price">
            Preço
          </v-btn>
          <v-btn prepend-icon="mdi-map-marker-distance" value="distance">
            Distancia
          </v-btn>
        </v-btn-toggle>
      </v-card-text>
    </v-card>

    <v-btn
      type="submit" 
      color="#2d6a4f"
      rounded
      block
      class="mt-4"
      @click="calculateBestStores"
      text="Buscar"
    >
    </v-btn>

    <v-bottom-sheet v-model="showResults">
      <!-- Resultado -->
      <v-card v-if="bestStores.length" class="mt-6">
       <v-card-title class="d-flex justify-space-between">
            <div>Melhores Lojas:</div>
            <p></p>
            <v-btn density="compact" icon="mdi-close" class="mt-1" elevation="4" @click="toggleShowResults"></v-btn>
        </v-card-title>

        <v-card-text>
          <div v-for="(store, index) in bestStores" :key="store.store.id" class="mb-4 p-2 border rounded">
            <h4 class="font-semibold">#{{ index + 1 }} - {{ store.store.name }}</h4>
            <p><strong>Preço total:</strong> R$ {{ store.totalPrice.toFixed(2) }}</p>
            <p><strong>Distância:</strong> {{ store.distance.toFixed(2) }} km</p>
            <p><strong>Produtos encontrados:</strong></p>
            <ul class="ml-4">
              <li v-for="p in store.foundProducts" :key="p.id_store">
                {{ p.name }}
                <br>
                <strong>R$ </strong>{{ p.price }}
              </li>
            </ul>
            <p v-if="store.missingProducts.length"><strong>Produtos não encontrados:</strong></p>
            <ul v-if="store.missingProducts.length">
              <li v-for="p in store.missingProducts" :key="p.id">{{ p.name }}</li>
            </ul>
            <v-btn
              append-icon="mdi-arrow-right-thick"
              color="#40916c"
              class="mt-2"
              block
              @click="goToBudgetPage(store.foundProducts, store.store)"
            >
              Seguir
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </v-card>
</template>

<script setup lang="ts">
import AddressPicker from "@/components/AddressPicker.vue";
import type { Product } from '~/types/Product';
import { ref } from "vue"
import { haversineDistance } from '~/util/geoUtils';
import type { ProductStore, ProdutStoreProductDetail, BestStoreResult } from "~/types/ProductStore";
import { useBudgetStore } from "~/stores/budget";
import type { Store } from "~/types/Store";

const router = useRouter();
const panel = ref([0])

const budgetStore = useBudgetStore()

const destinationCoords = ref<{ lat: number; lon: number; display_name: string } | null>(null);

const priorize = ref<string>("price");
const showResults = ref<boolean>(false);

function toggleShowResults() {
  showResults.value = !showResults.value;
}

function onDestinationSelect(coords: { lat: number; lon: number; display_name: string }) {
  destinationCoords.value = coords;
  console.log("Destino selecionado:", coords);
}

const selectedProducts = ref<Product[]>();
function onProductSelect(product: Product[]) {
  selectedProducts.value = product
}

function onProductClear() {
  selectedProducts.value = undefined
}

const storeStore = useStoreStore()
const productStoreStore = useProductStoreStore()

const bestStores = ref<BestStoreResult[]>([])

async function calculateBestStores() {
  const stores = await storeStore.fetch()
  const productsStore = await productStoreStore.fetch({ prop: '' })

  if (!selectedProducts.value || selectedProducts.value.length === 0) {
    alert("Selecione pelo menos um produto")
    return
  }

  if (!destinationCoords.value) {
    alert("Selecione um destino")
    return
  }

  const results: BestStoreResult[] = []

  for (const store of stores) {
    let totalPrice = 0
    const foundProducts: ProdutStoreProductDetail[] = []
    const missingProducts: Product[] = []

    for (const product of selectedProducts.value) {
      const ps = productsStore.items.find(
        (ps: ProductStore) => ps.id_store === store.id && ps.id_product === product.id
      )

      if (ps) {
        totalPrice += parseFloat(ps.price)
        foundProducts.push({...product, ...ps})
      } else {
        missingProducts.push(product)
      }
    }

    // Distância
    const distance = haversineDistance(
      destinationCoords.value.lat,
      destinationCoords.value.lon,
      store.lat,
      store.lon
    )

    results.push({ store, totalPrice, distance, foundProducts, missingProducts, score: 0 })
  }

  // 🔹 Verifica cobertura de produtos (quantos cada loja possui)
  const maxCoverage = Math.max(...results.map(r => r.foundProducts.length))

  // 🔹 Fallback: considera apenas lojas com maior cobertura
  const candidateStores = results.filter(r => r.foundProducts.length === maxCoverage && r.foundProducts.length > 0)

  if (candidateStores.length === 0) {
    bestStores.value = []
    return
  }

  // Normalizar preço e distância para calcular score
  const maxPrice = Math.max(...candidateStores.map(r => r.totalPrice))
  const maxDist = Math.max(...candidateStores.map(r => r.distance))

  const priceRate = priorize.value == "price" ? 0.6 : 0.4
  const distRate = priorize.value == "distance" ? 0.6 : 0.4

  candidateStores.forEach(r => {
    const priceNorm = maxPrice > 0 ? r.totalPrice / maxPrice : 0
    const distNorm = maxDist > 0 ? r.distance / maxDist : 0
    r.score = priceNorm * priceRate + distNorm * distRate
  })

  bestStores.value = candidateStores.sort((a, b) => a.score - b.score).slice(0, 3)
  toggleShowResults();
}

function goToBudgetPage(prodStore: Array<ProdutStoreProductDetail>, store: Store) {
  budgetStore.add(prodStore, store)
  router.push('/budget')
}



</script>

<style>
.background-primary {
  background-color: #D8F3DC;
}
</style>
