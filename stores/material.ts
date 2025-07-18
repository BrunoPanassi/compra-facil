import type { Material } from "~/types/Material";
import { showErrorMessage } from '~/util/Util';

const entity = 'material'
const label = 'Material'

export const useMaterialtore = defineStore(entity, {
    state: () => ({
        items: [] as Array<Material>
    }),
    actions: {
        async fetch() {
            const res = await $fetch<Material[]>(`/api/${entity}`);
            this.items = res;
        },
        async add(item: Material) {
            const { data, error } = await useFetch<Material>(`/api/${entity}`, {
                method: 'POST',
                body: item,
            });
            if (error.value) {
                const data = error.value.data
                const defaultMessage = `Falha ao cadastrar ${label}`
                showErrorMessage(defaultMessage, data?.message)
            }
            this.items.push(data.value as Material);
        },
        async update(item: Material) {
            const res = await $fetch<Material>(`/api/${entity}/${item.id}`, {
                method: 'PUT',
                body: item,
            });
            const index = this.items.findIndex(s => s.id === item.id);
            if (index !== -1) this.items[index] = res;
        },
        async delete(id: number) {
            await useFetch<Material>(`/api/${entity}/${id}`, {
                method: 'DELETE'
            });
            this.items = this.items.filter(s => s.id !== id);
        }
    }
})