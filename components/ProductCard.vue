<template>
  <CrudCard
    title="Produtos"
    :headers="headers"
    :items="productItems"
    v-model="register"
    @edit="editProduct"
    @delete="deleteProduct"
  >
    <template #form>
      <v-form ref="formRef" @submit.prevent="handleSubmit" validate-on="input">
        <ProductCombobox 
          @on-search="onProductSearch"
          @on-select="onProductSelect"
          @on-clear="onProductClear"
        />
        <v-select
          v-model="form.material_id"
          :disabled="isProductSelected"
          :items="materialTypes"
          label="Material"
          item-title="name"
          item-value="id"
          class="mb-3"
          :rules="[requiredRule]"
          required
        />
        <v-text-field v-model="form.brand" :disabled="isProductSelected" :rules="[requiredRule]" label="Marca" required class="mb-3" />
        <v-textarea v-model="form.desc" :disabled="isProductSelected" label="Descrição" class="mb-3"></v-textarea>

        <v-text-field
          v-model="priceFormatted"
          :disabled="isProductSelected"
          label="Preço"
          required
          class="mb-3"
          :rules="[requiredRule, priceRule(1)]"
          @blur="formatPrice"
          @focus="unformatPrice"
        />
        <v-text-field v-model.number="form.quantity" :disabled="isProductSelected" :rules="[requiredRule]" label="Quantidade" type="number" required class="mb-3" />

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
              :disabled="isProductSelected"
              :clearable="false"
              multiple
              @change="onFileChange"
              :rules="[maxQuantRule(6), minQuantRule(1)]"
              class="mb-3">
              <template v-slot:selection>
                <p v-if="form.images.length">{{ `${form.images.length} imagens` }}</p>
              </template>
            </v-file-input>
          </v-card-text>
        </v-card>

        <!-- Botões -->
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
import { useMaterialStore } from '#imports';
import type { Product } from '@/types/Product';
import { resizeAndCompressImage } from '~/util/image';
import { maxQuantRule, minQuantRule, priceRule, requiredRule } from '~/util/rule';
import ProductCombobox from './ProductCombobox.vue';

const productStore = useProductStore();
const materialStore = useMaterialStore();
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
  quantity: 1,
  images: [],
  material_id: 0
});
const price = ref<string>('');

const headers = [
  { title: 'Nome', key: 'name' },
  { title: 'Preço', key: 'price' },
  { title: 'Ações', key: 'actions', sortable: false }
];

const materialTypes = ref<{ id: number; name: string }[]>([]);

onMounted(async () => {
  await materialStore.fetch();
  materialTypes.value = materialStore.items;
  const { items } = await productStore.fetch({
    prop: 'name',
    search: '',
    page,
    perPage
  });
  productItems.value = items
});

const searchText = ref<string>();
function onProductSearch(text: string) {
  searchText.value = text
}

const selectedProduct = ref<Product|null>();
function onProductSelect(product: Product) {
  if (product != null) {
    searchText.value = product.name
    form.value.id = product.id
    form.value.material_id = product.material_id
    form.value.name = product.name
    form.value.brand = product.brand
    form.value.desc = product.desc
    form.value.images = product.images
  } else {
    onProductClear()
  }
}

function onProductClear() {
  searchText.value = ''
  selectedProduct.value = null
  form.value.id = 0
  form.value.material_id = 0
  form.value.brand = ''
  form.value.name = ''
  form.value.desc = ''
  form.value.images = []
}

const isProductSelected = computed(() => !!form.value.id)

async function handleSubmit() {
  if (formRef.value) {
    const { valid } = await formRef.value.validate()
    if (valid) {
      if (editingId.value !== null) {
        productStore.update({ ...form.value });
        editingId.value = null;
      } else {
        productStore.add({ ...form.value });
      }
      resetForm();
    }
  }
}

function editProduct(product: Product) {
  form.value = JSON.parse(JSON.stringify(product));
  editingId.value = product.id;
  register.value = true;
}

function deleteProduct(id: number) {
  productStore.delete(id);
}

function resetForm() {
  form.value = {
    id: 0,
    name: '',
    brand: '',
    desc: '',
    quantity: 1,
    images: [],
    material_id: 1
  };
  editingId.value = null;
  register.value = false;
}

const priceFormatted = ref('');

watch(
  () => form.value.quantity,
  (val) => {
    if (val < 0) form.value.quantity *= -1
  }
)

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
  form.value.price = value;
  priceFormatted.value = formatToCurrency(value);
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
