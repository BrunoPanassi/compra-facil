<template>
  <CrudCard
    title="Materiais"
    :headers="headers"
    :items="items"
    v-model="register"
    :loading-data-table="loading"
    @edit="editMaterial"
    @delete="deleteMaterial"
  >
    <template #form>
      <v-form @submit.prevent="handleSubmit">
        <v-text-field v-model="form.name" label="Nome" required class="mb-3" />
        <v-select
          v-model="form.type_id"
          :items="materialTypeStore.items"
          item-title="name"
          item-value="id"
          label="Tipo de Material"
          class="mb-3"
        />

        <v-row>
          <v-col cols="6" md="2">
            <v-btn class="mt-3" @click="resetForm">Fechar</v-btn>
          </v-col>
          <v-col cols="6" md="2">
            <v-btn type="submit" color="green" class="mt-3">Salvar</v-btn>
          </v-col>
        </v-row>
      </v-form>
    </template>
  </CrudCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMaterialTypeStore } from '@/stores/materialType';
import type { Material } from '@/types/Material';
import { useMaterialStore } from '~/stores/material';
import type { MaterialType } from '~/types/MaterialType';

const materialStore = useMaterialStore();
const materialTypeStore = useMaterialTypeStore();
const register = ref(false);
const editingId = ref<number | null>(null);

const form = ref<Material>({
  id: 0,
  name: '',
  type_id: 1,
});

const headers = [
  { title: 'Nome', key: 'name' },
  { title: 'Marca', key: 'brand' },
  { title: 'Peso', key: 'weight' },
  { title: 'Tipo', key: 'type' },
  { title: 'Ações', key: 'actions', sortable: false },
];

const loading = ref(false);
onMounted(() => {
  loading.value = true;
  materialStore.fetch();
  materialTypeStore.fetch();
  loading.value = false;
});

const items = computed(() => materialStore.items.map((mat: Material) => {
  return {
    ...mat,
    type: materialTypeStore.items.find((type: MaterialType) => type.id == mat.type_id)?.name
  }
}))

function handleSubmit() {
  if (editingId.value === null) {
    loading.value = true;
    materialStore.add({ ...form.value });
    loading.value = false;
  } else {
    loading.value = true;
    materialStore.update({ ...form.value });
    editingId.value = null;
    loading.value = false;
  }
  resetForm();
}

function editMaterial(material: Material) {
  form.value = JSON.parse(JSON.stringify(material));
  editingId.value = material.id;
  register.value = true;
}

function deleteMaterial(id: number) {
  loading.value = true;
  materialStore.delete(id);
  loading.value = false;
}

function resetForm() {
  form.value = { id: 0, name: '', type_id: 1 };
  editingId.value = null;
  register.value = false;
}
</script>