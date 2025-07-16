
import type { MaterialType } from '~/types/MaterialType';
import { showErrorMessage } from '~/util/Util';

const entityAPI = 'material-type'
const label = 'Tipo de Material'

export const useMaterialTypeStore = defineStore(entityAPI, {
    state: () => ({
        items: [] as Array<MaterialType>
    }),
    actions: {
        async fetch() {
            const res = await $fetch<MaterialType[]>(`/api/${entityAPI}`);
            this.items = res;
        },
        async add(item: MaterialType) {
            const { data, error } = await useFetch<MaterialType>(`/api/${entityAPI}`, {
                method: 'POST',
                body: item,
            });
            if (error.value) {
                const data = error.value.data
                const defaultMessage = `Falha ao cadastrar a ${label}`
                showErrorMessage(defaultMessage, data?.message)
            }
            this.items.push(data.value as MaterialType);
        },
        async update(item: MaterialType) {
            const res = await $fetch<MaterialType>(`/api/${entityAPI}/${item.id}`, {
                method: 'PUT',
                body: item,
            });
            const index = this.items.findIndex(s => s.id === item.id);
            if (index !== -1) this.items[index] = res;
        },
        async delete(id: number) {
            await useFetch<MaterialType>(`/api/${entityAPI}/${id}`, {
                method: 'DELETE'
            });
            this.items = this.items.filter(s => s.id !== id);
        }
    }
})