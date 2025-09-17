import type { ProdutStoreProductDetail } from "~/types/ProductStore";
import type { Store } from "~/types/Store";

export const useBudgetStore = defineStore('budget', {
    state: () => ({
        prodStore: [] as Array<ProdutStoreProductDetail>,
        store: {} as Store
    }),
    actions: {
        async add(prodStore: Array<ProdutStoreProductDetail>, store: Store) {
            this.prodStore = prodStore
            this.store = store
        },
        async clear() {
            this.prodStore = []
            this.store = {} as Store
        }
    },
    getters: {
        getProdStore: (state) => {
            return () => state.prodStore
        },
        getStore: (state) => {
            return () => state.store
        }
    }
})