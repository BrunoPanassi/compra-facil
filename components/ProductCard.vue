<template>
  <CrudCard
    title="Produtos"
    :headers="headers"
    :items="productStore.items"
    v-model="register"
    @edit="editProduct"
    @delete="deleteProduct"
  >
    <template #form>
      <v-form ref="formRef" @submit.prevent="handleSubmit" validate-on="input">
        <v-select
          v-model="form.material_id"
          :items="materialTypes"
          label="Material"
          item-title="name"
          item-value="id"
          class="mb-3"
          :rules="[requiredRule]"
          required
        />
        <v-text-field v-model="form.name" :rules="[requiredRule]" label="Nome" required class="mb-3" />
        <v-text-field v-model="form.brand" :rules="[requiredRule]" label="Marca" required class="mb-3" />

        <v-text-field
          v-model="priceFormatted"
          label="Preço"
          required
          class="mb-3"
          :rules="[requiredRule, priceRule(1)]"
          @blur="formatPrice"
          @focus="unformatPrice"
        />
        <v-text-field v-model.number="form.quantity" label="Quantidade" type="number" required class="mb-3" />

        <v-card>
          <v-card-subtitle>
            Imagens
          </v-card-subtitle>
          <v-card-text>
            <v-row v-if="form.images.length" class="mb-3">
              <v-col
                v-for="(img, index) in form.images"
                :key="index"
                cols="4"
              >
                <v-img :src="img" height="100" class="rounded" />
                <v-btn icon size="x-small" color="red" @click="removeImage(index)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-file-input
              label="Adicionar Imagem"
              accept="image/*"
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
            <v-btn size="small" color="grey" class="mt-3" @click="resetForm">Fechar</v-btn>
          </v-col>
          <v-col cols="6" md="2">
            <v-btn size="small" type="submit" color="primary" class="mt-3">Salvar</v-btn>
          </v-col>
        </v-row>
      </v-form>
    </template>
  </CrudCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useProductStore } from '@/stores/product';
import { useMaterialStore } from '#imports';
import type { Product } from '@/types/Product';
import { resizeAndCompressImage } from '~/util/image';
import { maxQuantRule, minQuantRule, priceRule, requiredRule } from '~/util/rule';

const productStore = useProductStore();
const materialStore = useMaterialStore();
const register = ref(false);
const editingId = ref<number | null>(null);

const formRef = ref()

const form = ref<Product>({
  id: 0,
  name: '',
  brand: '',
  price: '',
  quantity: 1,
  images: [],
  material_id: 1
});

const headers = [
  { title: 'Nome', key: 'name' },
  { title: 'Preço', key: 'price' },
  { title: 'Ações', key: 'actions', sortable: false }
];

const materialTypes = ref<{ id: number; name: string }[]>([]);

onMounted(async () => {
  await materialStore.fetch();
  materialTypes.value = materialStore.items;
  productStore.fetch();
});

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
    quantity: 1,
    price: '',
    images: [],
    material_id: 1
  };
  editingId.value = null;
  register.value = false;
}

const priceFormatted = ref('');

watch(
  () => form.value.price,
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
  priceFormatted.value = form.value.price.replace('.', ',');
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
