import type { Store } from "~/types/Store";
import { showErrorMessage } from '~/util/Util';

const entity = 'store'
const label = 'Loja'

export const useStoreStore = defineStore(entity, {
    state: () => ({
        items: [] as Array<Store>
    }),
    actions: {
        async fetch() {
            const res = await $fetch<Store[]>(`/api/${entity}`);
            this.items = res;
        },
        async add(item: Store) {
            const { data, error } = await useFetch<Store>(`/api/${entity}`, {
                method: 'POST',
                body: item,
            });
            if (error.value) {
                const data = error.value.data
                const defaultMessage = `Falha ao cadastrar a ${label}`
                showErrorMessage(defaultMessage, data?.message)
            }
            this.items.push(data.value as Store);
        },
        async update(item: Store) {
            const res = await $fetch<Store>(`/api/${entity}/${item.id}`, {
                method: 'PUT',
                body: item,
            });
            const index = this.items.findIndex(s => s.id === item.id);
            if (index !== -1) this.items[index] = res;
        },
        async delete(id: number) {
            await useFetch<Store>(`/api/${entity}/${id}`, {
                method: 'DELETE'
            });
            this.items = this.items.filter(s => s.id !== id);
        }
    },
    getters: {
        byOwner: (state) => {
            return (userId: number) => state.items?.filter(store => store.owner_id == userId)
        }
    }
})