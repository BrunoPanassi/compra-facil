import type { Options, Response } from "~/types/Paginated";
import type { ProductStore } from "~/types/ProductStore";
import { showErrorMessage } from '~/util/Util';

const entity = 'product-store'
const label = 'Produto/Loja'

export const useProductStore = defineStore(entity, {
    state: () => ({
        items: [] as Array<ProductStore>,
        total: 0 as number
    }),
    actions: {
        async fetch(options: Options) {
            const { items, total } = await $fetch<Response<ProductStore>>(`/api/${entity}`, {
                query: {
                    prop: options.prop,
                    search: options.search,
                    page: options.page,
                    perPage: options.perPage
                }
            }
            );
            return {
                items,
                total
            }
        },
        async add(item: ProductStore) {
            const { data, error } = await useFetch<ProductStore>(`/api/${entity}`, {
                method: 'POST',
                body: item,
            });
            if (error.value) {
                const data = error.value.data
                const defaultMessage = `Falha ao cadastrar ${label}`
                showErrorMessage(defaultMessage, data?.message)
            }
            this.items.push(data.value as ProductStore);
        },
        async update(item: ProductStore) {
            const res = await $fetch<ProductStore>(`/api/${entity}/${item.id}`, {
                method: 'PUT',
                body: item,
            });
            const index = this.items.findIndex(s => s.id === item.id);
            if (index !== -1) this.items[index] = res;
        },
        async delete(id: number) {
            await useFetch<ProductStore>(`/api/${entity}/${id}`, {
                method: 'DELETE'
            });
            this.items = this.items.filter(s => s.id !== id);
        }
    },
    getters: {
        productsByStore: (state) => {
            return (id_store: number) => state.items
                .filter(p => p.id_store == id_store)
                .map(p => {
                    return {
                        id_product: p.id_product, 
                        price: p.price
                    }
                })
        },
        storesByProduct: (state) => {
            return (id_product: number) => state.items
                .filter(p => p.id_product == id_product)
                .map(p => {
                    return {
                        id_store: p.id_store,
                        price: p.price
                    }
                })
        }
    }
})