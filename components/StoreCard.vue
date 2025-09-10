<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex justify-space-between">
        <div>Lojas</div>
        <p></p>
        <v-btn
          icon 
          density="compact"
          elevation="4" 
          class="ml-3" 
          @click="register = !register"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>

        <FormDialog 
          v-model="register" 
          :title="'Lojas'" 
          @handle-submit="handleSubmit"
          @reset-form="resetForm"
          @toggle-dialog="register = !register"
        >
          <template #card-text>
            <v-text-field v-model="form.name" label="Nome da Loja" required class="mb-3" />
            <v-text-field v-model="form.description" label="Descrição" required class="mb-3" />
            <v-expansion-panels v-model="panel">
              <v-expansion-panel title="Destino">
                <v-expansion-panel-text>
                  <AddressPicker @select="onDestinationSelect" />
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
            <v-text-field v-model.number="form.zip" v-maska="'########'" label="CEP" class="mb-3" @blur="fetchAddressByZip" />
            <v-text-field v-model="form.street" label="Rua" class="mb-2" />
            <v-text-field v-model.number="form.nr" label="Número" class="mb-2" />
            <v-text-field v-model="form.neighbr" label="Bairro" class="mb-2" />
            <v-text-field v-model="form.city" label="Cidade" class="mb-2" />
            <v-text-field v-model="form.state" label="Estado" class="mb-2" />
            <v-text-field v-model.number="form.cellphone" label="Telefone" class="mb-2" />
            <v-text-field v-model="form.email" label="Email" class="mb-2" />
          </template>
        </FormDialog>
      </v-card-title>

      <v-dialog
        max-width="500"
        v-model="deleteDialog"
        persistent
      >
        <v-card>
          <v-card-title class="text-overline">
            Deletar
          </v-card-title>
          <v-card-text class="text-body-2">
            <p>Deseja deletar o item <br>
              "<strong>{{ deletingItem?.name }}</strong>"?
            </p>
          </v-card-text>
          <v-card-actions>
            <v-btn color="grey" @click="confirmDelete(false)">Não</v-btn>
            <v-btn color="primary" @click="confirmDelete(true)">Sim</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <ConfirmDialog
        :title="'Deletar'"
        :message="'Deseja deletar o item '"
        :item="deletingItem?.name"
        v-model="deleteDialog"
        @confirm="confirmDelete"
      />
      
      <v-data-table 
        :mobile="$vuetify.display.mobile" 
        :headers="headers" 
        :items="store.items"  
        item-value="id" 
        class="elevation-1"
      >
        <template #item.actions="{ item }">
          <div class="d-flex ga-2 justify-start">
            <v-btn icon size="x-small" @click="onEdit(item)"><v-icon>mdi-pencil</v-icon></v-btn>
            <v-btn icon size="x-small" color="red" @click="onDelete(item)"><v-icon>mdi-delete</v-icon></v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useStoreStore } from '@/stores/store';
import type { Store } from '~/types/Store';
import { vMaska } from 'maska/vue';
import type { ViaCepResponse } from '~/types/ViaCEPResponse';
import ConfirmDialog from './ConfirmDialog.vue';

const panel = ref([0])

function onDestinationSelect(coords: { lat: number; lon: number; display_name: string }) {
  form.value.lat = coords.lat
  form.value.lon = coords.lon
  console.log("Destino selecionado:", coords);
}

const store = useStoreStore();
const authStore = useAuthStore()
const editingId = ref<number | null>(null);

const register = ref(false);
const deleteDialog = ref(false)
const deletingItem = ref<Store | null>(null);

const form = ref<Store>({
  id: 0,
  name: '',
  street: '',
  nr: 0,
  neighbr: '',
  city: '',
  state: '',
  zip: 0,
  lat: 0,
  lon: 0,
  owner_id: 0,
  description: '',
  cellphone: 0,
  email: ''
});

const headers = [
  { title: 'Nome', key: 'name' },
  { title: 'Cidade', key: 'city' },
  { title: 'Ações', key: 'actions', sortable: false },
];

onMounted(() => {
  store.fetch();
});

function setUserOnForm() {
  if (authStore.getId()) {
    form.value.owner_id = authStore.getId()
  }
}

async function handleSubmit() {
  setUserOnForm()
  if (editingId.value !== null) {
    await store.update({ ...form.value });
    editingId.value = null;
  } else {
    await store.add({ ...form.value });
  }
  resetForm();
}

async function fetchAddressByZip() {
  const cepOnlyDigits = form.value.zip.toString().replace(/\D/g, '');
  if (cepOnlyDigits.length === 8) {
    try {
      const { data, error } = await useFetch<ViaCepResponse>(`/api/via-cep/${form.value.zip}`);
      if (error.value) {
        alert('Erro ao buscar o CEP');
        return;
      }

      form.value.street = data.value?.logradouro ?? '';
      form.value.neighbr = data.value?.bairro ?? '';
      form.value.city = data.value?.localidade ?? '';
      form.value.state = data.value?.uf ?? '';
      form.value.zip = Number(cepOnlyDigits)
    } catch {
      alert('Falha inesperada ao buscar endereço');
    }
  }
}


function confirmDelete(confirm: boolean) {
  if (confirm && deletingItem.value?.id) {
    store.delete(deletingItem.value.id);
  }
  deleteDialog.value = !deleteDialog.value
  deletingItem.value = null;
}

function onEdit(store: Store) {
  form.value = JSON.parse(JSON.stringify(store));
  editingId.value = store.id;
  register.value = !register.value
}

function onDelete(item: Store) {
  deletingItem.value = item
  deleteDialog.value = !deleteDialog.value
}

function resetForm() {
  form.value = {
    id: 0,
    name: '',
    street: '',
    nr: 0,
    neighbr: '',
    city: '',
    state: '',
    zip: 0,
    lat: 0,
    lon: 0,
    owner_id: 0,
    description: '',
    cellphone: 0,
    cellphone_second: 0,
    email: '',
    facebook: '',
    instagram: '',
    another: '',
  };
  editingId.value = null;
  register.value = !register.value
}
</script>

<style scoped>
.v-data-table {
  margin-top: 20px;
}
</style>
