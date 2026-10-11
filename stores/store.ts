import type { BestStoreSearchParams, BestStoreResult } from '~/types/BestStore';
import type { Store } from "~/types/Store";
import { showErrorMessage } from '~/util/Util';

const entity = 'store'
const label = 'Loja'

const plainStoreValue = {
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
  cellphone: '',
  email: ''
}

export const useStoreStore = defineStore(entity, {
    state: () => ({
        bestStores: [] as BestStoreResult[],
        bestStoresLoading: false,
        bestStoresError: '',
        bestStoresRequest: 0,
        items: [] as Array<Store>,
        storeSelected: plainStoreValue as Store
    }),
    actions: {
        async fetchBestStores(params: BestStoreSearchParams) {
            const request = ++this.bestStoresRequest;
            this.bestStores = [];
            this.bestStoresError = '';
            this.bestStoresLoading = true;
            try {
                const results = await $fetch<BestStoreResult[]>('/api/store/best', { method: 'POST', body: params });
                if (request !== this.bestStoresRequest) return undefined;
                this.bestStores = results;
                return results;
            } catch {
                if (request === this.bestStoresRequest) {
                    this.bestStores = [];
                    this.bestStoresError = 'Falha ao buscar as melhores lojas. Tente novamente.';
                }
                return undefined;
            } finally {
                if (request === this.bestStoresRequest) this.bestStoresLoading = false;
            }
        },
        async fetch() {
            const res = await $fetch<Store[]>(`/api/${entity}`);
            this.items = res;
            return res;
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
        },
        setStoreSelected(store: Store) {
            this.storeSelected = store
        },
        unselectStore() {
            this.storeSelected = plainStoreValue
        }
    },
    getters: {
        byOwner: (state) => {
            return (userId: number) => state.items?.filter(store => store.owner_id == userId)
        },
        getPlainStore: () => {
            return plainStoreValue
        }
    }
})