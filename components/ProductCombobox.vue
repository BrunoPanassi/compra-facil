<template>
  <v-combobox
    v-model="selectedProduct"
    v-model:search="searchText"
    :loading="loading"
    hide-selected
    :items="productItems"
    item-value="id"
    item-title="name"
    return-object
    clearable
    label="Nome"
    variant="solo-filled"
    @update:search="onSearch"
    @update:model-value="onSelect"
    @click:clear="onClear"
  >
    <template v-slot:item="{ props, item }">
      <v-list-item 
        v-bind="props"
        :prepend-avatar="item.raw.images[0]"
        :title="item.raw.name"
      >
      </v-list-item>
    </template>
  </v-combobox>
</template>

<script setup lang="ts">
import { debounce } from 'lodash-es';
import type { Product } from '@/types/Product'; // você deve ter uma interface Product

const store = useProductStore()
const selectedProduct = ref<Product|null>();
const searchText = ref<string>();
const loading = ref(false);
const productItems = ref<Product[]>();

let page = 1; // TODO por enquanto 1, mas podemos implementar scroll infinito depois
let perPage = 10
let totalItems = 0

const fetchProducts = debounce(async (query: string) => {
   if (loading.value || (productItems.value && productItems.value.length >= totalItems && page !== 1)) return;
  
  loading.value = true;
  if (query) {
    const { items, total } = await store.fetch({
      prop: 'name',
      search: query,
      page,
      perPage

    })
    productItems.value = items
    totalItems = total
  } else {
    productItems.value = []
  }
  loading.value = false
}, 400);

const emit = defineEmits(['onSearch', 'onSelect', 'onClear'])

function onSearch(val: string) {
  page = 1;
  fetchProducts(val);
  debounce(() => emit('onSearch', val), 500)
}

function onClear() {
    searchText.value = ''
    selectedProduct.value = null
    productItems.value = []
    emit('onClear')
}

function onSelect() {
    emit('onSelect', selectedProduct.value)
}
</script>
