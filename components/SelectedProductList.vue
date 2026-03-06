<template>
  <v-list lines="two" density="comfortable" class="mb-4">
    <v-list-item
      v-for="product in budgetProductsStore.getProducts()"
      :key="product.id"
      class="flex-column align-start"
    >
      <!-- Linha principal -->
      <div class="w-100 d-flex align-center justify-space-between">
        <div class="d-flex align-center ga-3">
          <v-avatar size="48">
            <v-img :src="product.images[0]" cover />
          </v-avatar>

          <span class="text-caption">{{ product.name }}</span>
        </div>

        <!-- Quantidade -->
        <div
          v-if="showQuantity"
          class="d-flex align-center ga-1"
        >
          <v-btn
            icon
            size="x-small"
            variant="tonal"
            @click="updateQuantity(product.id, product.quantity - 1)"
          >
            <v-icon>mdi-minus</v-icon>
          </v-btn>

          <span class="font-weight-medium px-2">
            {{ product.quantity }}
          </span>

          <v-btn
            icon
            size="x-small"
            variant="tonal"
            @click="updateQuantity(product.id, product.quantity + 1)"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- Linha secundária (mobile friendly) -->
      <div class="w-100 mt-2">
        <v-expansion-panels variant="accordion">
          <v-expansion-panel>
            <v-expansion-panel-title>
              Ver detalhes
            </v-expansion-panel-title>

            <v-expansion-panel-text>
              <div class="text-body-2">
                <p v-if="product.description">
                  <strong>Descrição:</strong> {{ product.description }}
                </p>
                <p v-if="product.brand">
                  <strong>Marca:</strong> {{ product.brand }}
                </p>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
    </v-list-item>

    <v-divider class="my-3" />

    <!-- Total -->
    <v-list-item>
      <v-list-item-title class="font-weight-bold">
        Total de itens
      </v-list-item-title>

      <template #append>
        <v-chip size="large" variant="elevated">
          {{ totalQuantity }}
        </v-chip>
      </template>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Product, SelectedProduct } from '@/types/Product'

interface Props {
  products: Product[] | undefined
  showQuantity?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showQuantity: true,
})

const budgetProductsStore = useBudgetProductsStore()

const emit = defineEmits<{
  (e: 'update:selectedProducts', value: SelectedProduct[]): void
}>()

/**
 * Estado interno com quantidade
 */
const selectedProducts = ref<SelectedProduct[]>([])
onMounted(() => selectedProducts.value = budgetProductsStore.getProducts())
/**
 * Inicializa ou sincroniza os produtos recebidos
 */
watch(
  () => props.products,
  (products) => {
    if (products) {
      
      const filterIds = new Set(selectedProducts.value.map(product => product.id))
      const newProducts = products
        .filter(product => !filterIds.has(product.id))
        .map(product => {
          return {
            ...product,
            quantity: 1
          }
        })
      // const newProducts = products.map(product => {
      //   const existing = selectedProducts.value.find(p => p.id === product.id)

      //   return {
      //     ...product,
      //     quantity: existing?.quantity ?? 1,
      //   }
      // })
      
      selectedProducts.value.push(...newProducts)
      
      budgetProductsStore.update(selectedProducts.value)
      emit('update:selectedProducts', selectedProducts.value)
    }
    
  },
  { immediate: true }
)

/**
 * Atualiza quantidade
 */
const updateQuantity = (productId: number, value: number) => {
  const product = selectedProducts.value.find(p => p.id === productId)
  if (!product) return

  product.quantity = Math.max(0, value)
  if (!product.quantity) {
    selectedProducts.value = selectedProducts.value.filter(product => product.id != productId)
  }
  budgetProductsStore.update(selectedProducts.value)
  emit('update:selectedProducts', selectedProducts.value)
}


/**
 * Total de itens
 */
const totalQuantity = computed(() =>
  selectedProducts.value.reduce((total, p) => total + p.quantity, 0)
)

</script>

