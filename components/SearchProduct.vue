<template>
  <ProductCombobox 
    :disabled="false"
    @on-select="onProductSelect"
    @on-clear="onProductClear"
  />
</template>

<script setup lang="ts">
import type { Product } from '~/types/Product';


const selectedProduct = ref<Product>();
function onProductSelect(product: Product) {
  selectedProduct.value = product
}

function onProductClear() {
  selectedProduct.value = undefined
}


</script>
