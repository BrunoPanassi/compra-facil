<template>
    <div>
        <DialogForm v-model="dialogValue" title="Produtos selecionados">
          <v-list lines="two" density="comfortable" class="mb-4">
            <v-list-item
              v-for="product in selectedProducts"
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
                  class="d-flex align-center ga-1"
                >
                  <span class="font-weight-medium px-2">
                    {{ product.quantity }}
                  </span>

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
                  {{ budgetProductsStore.getTotal() }}
                </v-chip>
              </template>
            </v-list-item>
            <v-btn @click="cleanBudgetProducts">
              Limpar
            </v-btn>
          </v-list>
        </DialogForm>
    </div>
</template>

<script setup lang="ts">
import DialogForm from './DialogForm.vue';

const props = defineProps({
  modelValue: Boolean
});

const emit = defineEmits(['update:modelValue']);

const budgetProductsStore = useBudgetProductsStore()

const selectedProducts = computed(() => budgetProductsStore.getProducts())
const total = computed(() => budgetProductsStore.getTotal())

function cleanBudgetProducts() {
  console.log("clear")
  budgetProductsStore.clear()
}

const dialogValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});
</script>

<style scoped>

</style>