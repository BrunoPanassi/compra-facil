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
          @click="onNew"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>

        <FormDialog 
          v-model="register" 
          :title="'Lojas'" 
          @handle-submit="handleSubmit"
          @reset-form="onResetForm"
          @toggle-dialog="toggleRegister"
        >
          <template #card-text>
            <v-text-field v-model="form.name" label="Nome da Loja" :rules="[requiredRule]" class="mb-3" />
            <v-text-field v-model="form.description" label="Descrição" :rules="[requiredRule]" class="mb-3" />
            <v-expansion-panels v-model="panel">
              <v-expansion-panel title="Destino">
                <v-expansion-panel-text>
                  <AddressPicker
                    :get-user-location="false"
                    :lat="form.lat"
                    :lon="form.lon"
                    :display-name="getDisplayName"
                    @select="onDestinationSelect" 
                  />
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
            <v-text-field v-model.number="form.zip" :rules="[requiredRule]" v-maska="'########'" label="CEP" class="mb-3"/>
            <v-text-field v-model="form.street" :rules="[requiredRule]" label="Rua" class="mb-2" />
            <v-text-field v-model.number="form.nr" :rules="[requiredRule]" label="Número" class="mb-2" />
            <v-text-field v-model="form.neighbr" :rules="[requiredRule]" label="Bairro" class="mb-2" />
            <v-text-field v-model="form.city" :rules="[requiredRule]" label="Cidade" class="mb-2" />
            <v-text-field v-model="form.state" :rules="[requiredRule]" label="Estado" class="mb-2" />
            <v-text-field v-model.number="form.cellphone"  :rules="[requiredRule]" label="Telefone" class="mb-2" />
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
        :items="storeStore.items"  
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
import { AddressCoordinates } from '~/types/Address.js';
import { requiredRule } from '~/util/rule.js';

const panel = ref([0])

function onDestinationSelect(addressCoordinates: AddressCoordinates) {
  const { coordinates, address } = addressCoordinates
  form.value.lat = coordinates.lat
  form.value.lon = coordinates.lon
  if (address) {
    const postCode = address.postcode.includes("-") ? address.postcode.replace("-", "") : address.postcode
    form.value.zip = Number(postCode)
  }
}

const storeStore = useStoreStore();
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
  storeStore.fetch();
});

function onNew() {
  resetForm()
  toggleRegister()
}

function toggleRegister() {
  register.value = !register.value
}

function setUserOnForm() {
  if (authStore.getId()) {
    form.value.owner_id = authStore.getId()
  }
}

async function handleSubmit(valid: boolean) {
  if (valid) {
    setUserOnForm()
    if (editingId.value !== null) {
      await storeStore.update({ ...form.value });
      editingId.value = null;
    } else {
      await storeStore.add({ ...form.value });
    }
    onResetForm();
  }
}

const getDisplayName = computed(() => {
  if (form.value.street && form.value.zip) {
    return form.value.street.concat(' '.concat(form.value.zip.toString()))
  }
  return ""
})

async function fetchAddressByZip() {
  if (form.value.zip) {
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
}


function confirmDelete(confirm: boolean) {
  if (confirm && deletingItem.value?.id) {
    storeStore.delete(deletingItem.value.id);
  }
  deleteDialog.value = !deleteDialog.value
  deletingItem.value = null;
}

function onEdit(store: Store) {
  form.value = JSON.parse(JSON.stringify(store));
  storeStore.setStoreSelected(store)

  editingId.value = store.id;
  toggleRegister()
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
    nr: null,
    neighbr: '',
    city: '',
    state: '',
    zip: null,
    lat: 0,
    lon: 0,
    owner_id: 0,
    description: '',
    cellphone: null,
    email: ''
  }
}

function onResetForm() {
  resetForm()
  editingId.value = null;
  toggleRegister()
}

watch(() => form.value.zip, () => {
  if (form.value.zip && form.value.zip.toString().length >= 8) {
    setTimeout(() => {
      fetchAddressByZip()
    }, 600);
  }
})

watch(() => register.value, () => {
  if (!register.value) {
    storeStore.unselectStore()
  }
})
</script>

<style scoped>
.v-data-table {
  margin-top: 20px;
}
</style>
