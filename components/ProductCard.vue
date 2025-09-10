<template>
  <CrudCard
    title="Produtos"
    :headers="headers"
    :items="productStoreDataTable"
    v-model="register"
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
        <ProductCombobox
          :multiple="false"
          :product="selectedProduct"
          :disabled="!isStoreSelected"
          @on-search="onProductSearch"
          @on-select="onProductSelect"
          @on-clear="onProductClear"
        />
        <v-select
          v-model="form.material_id"
          :disabled="isProductSelectedOrStoreNotSelected"
          :items="materialTypes"
          label="Material"
          hide-selected
          item-title="name"
          item-value="id"
          class="mb-3"
          :rules="[requiredRule]"
          required
        />
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
import { resizeAndCompressImage } from '~/util/image';
import { maxQuantRule, minQuantRule, priceRule, requiredRule } from '~/util/rule';
import ProductCombobox from './ProductCombobox.vue';
import { type ProductStore, type ProductStoreDataTable } from '~/types/ProductStore';

const productStore = useProductStore();
const materialStore = useMaterialStore();
const storeStore = useStoreStore()
const productStoreStore = useProductStoreStore()

const register = ref(false);
const editingId = ref<number | null>(null);
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

const materialTypes = computed(() => [{ id: 0, name: ''}, ...materialStore.items]);

onMounted(async () => {
  initStores();
});

async function initStores() {
  await materialStore.fetch();
  await storeStore.fetch();
}

const searchText = ref<string>();
function onProductSearch(text: string) {
  searchText.value = text
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
async function onStoreSelect() {
  if (storeSelected.value) {
    const { items } = await productStoreStore.byStore(storeSelected.value)
    if (items.length) {

      const productIds = items.map(prodStore => prodStore.id_product)
      const products = await productStore.fetch({
        prop: '',
        ids: productIds.join(',')
      })

      productStoreDataTable.value = products.items
          .map(prod => {
            const prodStor = items.find(prodStor => prodStor.id_product == prod.id)
            return {
              id: prodStor?.id || 0,
              id_store: prodStor?.id_store || 0,
              product: prod,
              price: prodStor?.price || '',
              quantity: prodStor?.quantity || 0
            }
          })
    } else {
      productStoreDataTable.value = []
    }
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

async function handleSubmitProductAndStore() {
  const { valid } = await formRef.value.validate()
  if (valid) {
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
    const files = file.target.files
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
            form.value.images.push(data as string)
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
