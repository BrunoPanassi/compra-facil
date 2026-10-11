<template>
  <v-card class="p-4 background-primary">
    <v-card>
      <v-card-title class="text-h6">
        Produtos
      </v-card-title>
      <ProductCombobox 
        label="Selecione"
        :disabled="false"
        :multiple="true"
        @on-select="onProductSelect"
      />
    </v-card>

    <SelectedProductList
      v-model:products="selectedProducts"
      :show-quantity="true"
    />

    <v-card class="mb-4">
      <v-card-title class="text-h6">
        Destino
      </v-card-title>
      <v-card-item class="pa-4">
        <AddressPicker @select="onDestinationSelect" />
      </v-card-item>
    </v-card>

    <v-card>
      <v-card-title class="text-h6">
        Buscar Loja
      </v-card-title>
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
        <p class="mt-6">Máximo raio de distância: 
          <span class="font-weight-bold">{{ maxDistanceKm }} km</span>
        </p>
        <v-slider v-model="maxDistanceKm" min="20" max="200" step="1" class="align-center" hide-details></v-slider>
      </v-card-text>
      <v-card-item class="px-6">
        <v-btn
          type="submit" 
          color="#2d6a4f"
          rounded
          block
          :loading="storeStore.bestStoresLoading"
          @click="calculateBestStores"
          text="Buscar"
        >
        </v-btn>
      </v-card-item>
    </v-card>

    <v-alert v-if="storeStore.bestStoresError" type="error" class="mt-4">{{ storeStore.bestStoresError }}</v-alert>

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
              <li v-for="p in store.foundProducts" :key="p.id_product">
                {{ p.name }}
                <br>
                <strong>R$ </strong>{{ p.price }} × {{ p.requestedQuantity }} = {{ p.subtotal }}
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
import { storeToRefs } from "pinia";
import SelectedProductList from '@/components/SelectedProductList.vue'
import type { ProdutStoreProductDetail } from "~/types/ProductStore";
import { useBudgetStore } from "~/stores/budget";
import type { Store } from "~/types/Store";
import { AddressCoordinates } from "~/types/Address";

const router = useRouter();

const budgetStore = useBudgetStore()

const destinationCoords = ref<{ lat: number; lon: number; display_name: string } | null>(null);

const maxDistanceKm = ref<number>(20);

const priorize = ref<"price" | "distance">("price");
const showResults = ref<boolean>(false);

function toggleShowResults() {
  showResults.value = !showResults.value;
}

function onDestinationSelect(addressCoordinates: AddressCoordinates) {
  const { coordinates } = addressCoordinates
  destinationCoords.value = coordinates;
  console.log("Destino selecionado:", coordinates);
}

const selectedProducts = ref<Product[]>();
function onProductSelect(products: Product[]) {
  selectedProducts.value = products
}

const storeStore = useStoreStore()
const budgetProductsStore = useBudgetProductsStore()
const { bestStores } = storeToRefs(storeStore)

async function calculateBestStores() {
  showResults.value = false;
  const products = budgetProductsStore.getProducts();
  if (!products.length) {
    storeStore.bestStores = [];
    alert("Selecione pelo menos um produto");
    return;
  }
  if (!destinationCoords.value) {
    alert("Selecione um destino");
    return;
  }
  const results = await storeStore.fetchBestStores({
    products: products.map(product => ({ productId: product.id, quantity: product.quantity })),
    latitude: destinationCoords.value.lat,
    longitude: destinationCoords.value.lon,
    priority: priorize.value,
    maxDistanceKm: maxDistanceKm.value
  });
  if (results) {
    showResults.value = results.length > 0;
    if (!results.length) alert("Nenhuma loja possui estoque suficiente para os produtos selecionados");
  }
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
