<template>
  <CrudCard
    title="Tipos de Materiais"
    :headers="headers"
    :items="store.items"
    v-model="register"
    @edit="editMaterial"
    @delete="deleteMaterial"
  >
    <template #form>
      <v-form @submit.prevent="handleSubmit">
        <v-text-field v-model="form.name" label="Nome" required class="mb-3" />

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
import type { MaterialType } from '~/types/MaterialType';
const store = useMaterialTypeStore();
const register = ref(false);
const editingId = ref<number | null>(null);

const form = ref<MaterialType>({
  id: 0,
  name: '',
});

const headers = [
  { title: 'id', key: 'id' },
  { title: 'Nome', key: 'name' },
  { title: 'Ações', key: 'actions', sortable: false },
];

const loading = ref(false);
onMounted(() => {
  loading.value = true;
  store.fetch();
  loading.value = false;
});

function handleSubmit() {
  if (editingId.value === null) {
    store.add({ ...form.value });
  } else {
    loading.value = true;
    store.update({ ...form.value });
    editingId.value = null;
    loading.value = false;
  }
  resetForm();
}

function editMaterial(material: MaterialType) {
  form.value = JSON.parse(JSON.stringify(material));
  editingId.value = material.id;
  register.value = true;
}

function deleteMaterial(id: number) {
  loading.value = true;
  store.delete(id);
  loading.value = false;
}

function resetForm() {
  form.value = { id: 0, name: ''};
  editingId.value = null;
  register.value = false;
}
</script>