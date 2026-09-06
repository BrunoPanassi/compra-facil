<template>
  <CrudCard
    title="Produtos/Loja"
    :headers="headers"
    :items="productStoreDataTable"
    v-model="register"
    :loading-data-table="loading"
    @edit="editProduct"
    @delete="deleteProduct"
  >
    <template #must-select-before>
      <v-select
        v-model="storeSelected"
        :items="storeStore.items"
        label="Loja"
        item-title="name"
        item-value="id"
        class="mb-3"
        @update:model-value="onStoreSelect"
      />
    </template>
    <template #form>
      <v-select
        v-model="storeSelected"
        :items="storeStore.items"
        label="Loja"
        item-title="name"
        item-value="id"
        class="mb-3"
      />
      <v-form ref="formRef" @submit.prevent="handleSubmit" validate-on="input">
        <span class="text-caption">Pesquise se o produto já se encontra cadastrado:</span>
        <ProductCombobox
          :multiple="false"
          label="Produto"
          :product="selectedProduct"
          clearable
          @on-select="onProductSelect"
          @on-clear="onProductClear"
        />
        <span class="text-caption">Caso contrário, cadastre o nome dele:</span>
        <v-text-field 
          v-model="searchText" 
          label="Nome"
          :disabled="!isStoreSelected || !!selectedProduct"
        >
        </v-text-field>
        <v-select
          v-model="form.material_id"
          :disabled="isProductSelectedOrStoreNotSelected"
          :items="materialTypes"
          label="Material"
          hide-selected
          item-value="id"
          class="mb-3"
          :rules="[requiredRule]"
          required
        >
          <template #selection="{ item }">
            <div v-if="item.raw.weight">
              {{ item.raw.name }} - {{ `${item.raw.weight}(kg)` }}
            </div>
          </template>

          <!-- Customizes the dropdown menu items -->
          <template #item="{ props, item }">
            <v-list-item v-bind="props">
              <template #title>
                <strong>{{ item.raw.name }}</strong> - {{ `${item.raw.weight}(kg)` }}
              </template>
            </v-list-item>
          </template>
        </v-select>
        <v-text-field v-model="form.brand" :disabled="isProductSelectedOrStoreNotSelected" :rules="[requiredRule]" label="Marca" required class="mb-3" />
        <v-textarea v-model="form.desc" :disabled="isProductSelectedOrStoreNotSelected" label="Descrição" class="mb-3"></v-textarea>

        <v-card>
          <v-card-subtitle>
            Imagens
          </v-card-subtitle>
          <v-card-text>
            <v-row v-if="form.images" class="mb-3">
              <v-col
                v-for="(img, index) in form.images"
                :key="index"
                cols="4"
              >
                <v-img :src="img" height="100" class="rounded" />
                <v-btn v-if="!isProductSelected" icon size="x-small" color="red" @click="removeImage(index)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-file-input
              label="Adicionar Imagem"
              accept="image/*"
              :disabled="isProductSelectedOrStoreNotSelected"
              :clearable="false"
              multiple
              @change="onFileChange"
              :rules="[maxQuantRule(6)]"
              class="mb-3">
              <template v-slot:selection>
                <p v-if="form.images.length">{{ `${form.images.length} imagens` }}</p>
              </template>
            </v-file-input>
          </v-card-text>
        </v-card>

        <v-text-field
          v-model="priceFormatted"
          label="Preço"
          required
          class="mb-3"
          :rules="[requiredRule, priceRule(1)]"
          @blur="formatPrice"
          @focus="unformatPrice"
        />

        <v-text-field
          v-model.number="quantity"
          label="Quantidade"
          required
          class="mb-3"
          :rules="[requiredRule]"
        />
        <v-alert v-if="error" type="error" class="mt-3">{{ error }}</v-alert>
        <!-- Botões -->
        <v-row>
          <v-col cols="6" md="2">
            <v-btn class="mt-3" @click="closeModal">Fechar</v-btn>
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
import { useMaterialStore } from '#imports';
import type { Product } from '@/types/Product';
import { resizeAndCompressImage, uploadImageHostingReturnUrl } from '~/util/image';
import { maxQuantRule, priceRule, requiredRule } from '~/util/rule';
import ProductCombobox from './ProductCombobox.vue';
import { type ProductStore, type ProductStoreDataTable } from '~/types/ProductStore';

const productStore = useProductStore();
const materialStore = useMaterialStore();
const storeStore = useStoreStore()
const productStoreStore = useProductStoreStore()

const register = ref(false);
const editingId = ref<number | null>(null);
const searchText = ref<string>();
const productItems = ref<Product[]>();

let page = 1; // TODO por enquanto 1, mas podemos implementar scroll infinito depois
let perPage = 10

const formRef = ref()

const form = ref<Product>({
  id: 0,
  name: '',
  brand: '',
  desc: '',
  images: [],
  material_id: 0
});

const productStoreForm = ref<ProductStore>({
  id: 0,
  id_store: 0,
  id_product: 0,
  price: '',
  quantity: 1
})

const headers = [
  { title: 'Produto', key: 'product.name' },
  { title: 'Preço', key: 'price' },
  { title: 'Ações', key: 'actions', sortable: false }
];

const materialTypes = computed(() => [{ id: 0, name: '', weight: 0}, ...materialStore.items]);

onMounted(async () => {
  initStores();
});

async function initStores() {
  await materialStore.fetch();
  await storeStore.fetch();
}

const selectedProduct = ref<Product>();
function onProductSelect(product: Product) {
  if (product != null) {
    searchText.value = product.name
    selectedProduct.value = product
    setFormOnProductValues(product)
  } else {
    onProductClear()
  }
}

function onProductClear() {
  searchText.value = ''
  selectedProduct.value = undefined
  resetForm()
}

const storeSelected = ref<number>();
const productStoreDataTable = ref<ProductStoreDataTable[]>()
const loading = ref(false);
let storeRequest = 0;
async function onStoreSelect() {
  const request = ++storeRequest;
  const storeId = storeSelected.value;
  productStoreDataTable.value = [];
  loading.value = !!storeId;
  error.value = '';
  if (!storeId) return;
  try {
    const { items } = await productStoreStore.byStore(storeId);
    if (request === storeRequest && storeSelected.value === storeId) productStoreDataTable.value = items;
  } catch {
    if (request === storeRequest) error.value = 'Falha ao carregar os produtos da loja.';
  } finally {
    if (request === storeRequest) loading.value = false;
  }
}

function setFormOnProductValues(product: Product) {
  form.value.id = product.id
  form.value.material_id = product.material_id
  form.value.name = product.name
  form.value.brand = product.brand
  form.value.desc = product.desc
  form.value.images = product.images
}

const isProductSelected = computed(() => !!selectedProduct.value?.id)
const isStoreSelected = computed(() => !!storeSelected.value)
const isProductSelectedOrStoreNotSelected = computed(() => isProductSelected.value || !isStoreSelected.value)

async function handleSubmit() {
  if (editingId.value !== null) {
    handleEditProduct()
  } else {
    handleSubmitProductAndStore()
  }
  onStoreSelect()
}

function handleEditProduct() {
  if (editingId.value
    && storeSelected.value
    && selectedProduct.value
    && price.value
    && quantity.value
  ) {
    productStoreStore.update({
      id: editingId.value,
      id_store: storeSelected.value,
      id_product: selectedProduct.value.id,
      price: price.value,
      quantity: quantity.value
    })
    editingId.value = null;

    closeModal()
    resetForm()
  }
}

const error = ref('')
async function handleSubmitProductAndStore() {
  const { valid } = await formRef.value.validate()
  if (valid) {
    if (!selectedProduct.value && !searchText.value) {
      error.value = "O nome do produto deve ser informado!"
      return
    }
    if (selectedProduct.value?.id && storeSelected.value) {
      await productStoreStore.add(
        { 
          id: 0, 
          id_store: storeSelected.value, 
          id_product: selectedProduct.value.id, 
          price: price.value, 
          quantity: quantity.value
        }
      )
    } else if (searchText.value) {
      const name = searchText.value
      const product = await productStore.add({ ...form.value, name });
      if ((product !== null || typeof product != 'undefined') && product?.id && storeSelected.value) {
        await productStoreStore.add(
        { 
          id: 0, 
          id_store: storeSelected.value, 
          id_product: product?.id, 
          price: price.value, 
          quantity: quantity.value
        })
      }
    }
    closeModal()
    resetForm()
    onStoreSelect()
  }
}

function editProduct(prodStor: ProductStoreDataTable) {
  selectedProduct.value = prodStor.product
  price.value = prodStor.price
  quantity.value = prodStor.quantity
  editingId.value = prodStor.id;
  register.value = true;
}

function deleteProduct(id: number) {
  productStoreStore.delete(id);
  onStoreSelect()
}

function closeModal() {
  register.value = false
}

function resetForm() {
  form.value = {
    id: 0,
    name: '',
    brand: '',
    desc: '',
    images: [],
    material_id: 0
  };
}

const quantity = ref<number>(1);
watch(
  () => quantity.value,
  (val) => {
    if (val < 0) quantity.value *= -1
  }
)

const price = ref<string>('');
const priceFormatted = ref('');
watch(
  () => price.value,
  (val) => {
    priceFormatted.value = formatToCurrency(val);
  },
  { immediate: true }
);

function formatToCurrency(value: string): string {
  const num = parseFloat(value || '0');
  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  });
}

function formatPrice() {
  const raw = priceFormatted.value.replace(/\D/g, '');
  const value = (parseInt(raw || '0') / 100).toFixed(2); // string com 2 casas
  price.value = value;
}

function unformatPrice() {
  priceFormatted.value = price.value.replace('.', ',');
}

const onFileChange = async (file: any) => {
    const validTypes = ['image/jpeg', 'image/png'];
    const QUANTIDADE_MAXIMA_IMAGENS = 6
    if (!file) {
        return
    }
    const files = file.target.files as FileList
    let count = files.length;
    if (count > QUANTIDADE_MAXIMA_IMAGENS
      || (form.value.images.length + count) > QUANTIDADE_MAXIMA_IMAGENS
      || form.value.images.length == QUANTIDADE_MAXIMA_IMAGENS) {
      alert("Permitido somente selecionar até 6 imagens")
      return
    }
    let index = 0;

    while(count --) {
          const file: File = files[index]
          if (!validTypes.includes(file.type)) {
            alert('A imagem deve ser JPG ou PNG.');
            return;
          }

          try {
            const data = await resizeAndCompressImage(file, {
              maxWidth: 800,
              maxHeight: 800,
              quality: 0.7,
            });

            const imageUrl = await uploadImageHostingReturnUrl(data)
            form.value.images.push(imageUrl)
            
            index++
          } catch (e) {
            alert(e)
            count = 0
          }
        }
    
}

function removeImage(index: number) {
  form.value.images.splice(index, 1);
}
</script>
