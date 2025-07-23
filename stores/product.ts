import type { Product } from "~/types/Product";
import { showErrorMessage } from '~/util/Util';

const entity = 'product'
const label = 'Produto'

export const useProductStore = defineStore(entity, {
    state: () => ({
        items: [] as Array<Product>
    }),
    actions: {
        async fetch() {
            const res = await $fetch<Product[]>(`/api/${entity}`);
            this.items = res;
        },
        async add(item: Product) {
            const { data, error } = await useFetch<Product>(`/api/${entity}`, {
                method: 'POST',
                body: item,
            });
            if (error.value) {
                const data = error.value.data
                const defaultMessage = `Falha ao cadastrar ${label}`
                showErrorMessage(defaultMessage, data?.message)
            }
            this.items.push(data.value as Product);
        },
        async update(item: Product) {
            const res = await $fetch<Product>(`/api/${entity}/${item.id}`, {
                method: 'PUT',
                body: item,
            });
            const index = this.items.findIndex(s => s.id === item.id);
            if (index !== -1) this.items[index] = res;
        },
        async delete(id: number) {
            await useFetch<Product>(`/api/${entity}/${id}`, {
                method: 'DELETE'
            });
            this.items = this.items.filter(s => s.id !== id);
        }
    }
})