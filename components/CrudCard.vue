<template>
  <div>
    <v-card>
      <v-card-title class="d-flex justify-space-between">
        <div>{{ title }}</div>
        <v-btn icon density="compact" elevation="4" class="ml-3" @click="toggleDialog">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-card-title>

      <slot name="must-select-before"/>
      
      <DialogForm v-model="dialogValue" :title="`Cadastro de ${title}`">
        <slot name="form" />
      </DialogForm>

      <DeleteDialog
        v-model="deleteDialog"
        :item-name="deletingItem?.name ?? ''"
        @cancel="cancelDelete"
        @confirm="confirmDelete"
      />
    </v-card>
    <v-data-table
        :headers="headers"
        :items="items"
        item-value="id"
        class="elevation-1"
        :mobile="$vuetify.display.mobile"
      >
        <template #item.actions="{ item }">
          <div class="d-flex ga-2 justify-start">
            <v-btn icon size="x-small" @click="$emit('edit', item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon size="x-small" color="red" @click="prepareDelete(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>
        </template>
      </v-data-table>
  </div>
</template>

<script setup lang="ts">
import DialogForm from './DialogForm.vue';
import DeleteDialog from './DeleteDialog.vue';
import { ref, computed } from 'vue';

const props = defineProps({
  title: String,
  headers: { type: Array<Object>, default: []},
  items: Array,
  modelValue: Boolean
});

const emit = defineEmits(['edit', 'delete', 'update:modelValue']);

const deleteDialog = ref(false);
const deletingItem = ref<any>(null);

const dialogValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

function toggleDialog() {
  emit('update:modelValue', !props.modelValue);
}

function prepareDelete(item: any) {
  deletingItem.value = item;
  deleteDialog.value = true;
}

function cancelDelete() {
  deleteDialog.value = false;
  deletingItem.value = null;
}

function confirmDelete() {
  if (deletingItem.value?.id) {
    emit('delete', deletingItem.value.id);
  }
  cancelDelete();
}
</script>
