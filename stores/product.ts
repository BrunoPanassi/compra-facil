import type { Options, Response } from "~/types/Paginated";
import type { Product } from "~/types/Product";
import { showErrorMessage } from '~/util/Util';

const entity = 'product'
const label = 'Produto'

export const useProductStore = defineStore(entity, {
    state: () => ({
        items: [] as Array<Product>,
        total: 0 as number
    }),
    actions: {
        async fetch(options: Options) {
            if (options.prop) {
                const { items, total } = await $fetch<Response<Product>>(`/api/${entity}`, {
                    query: {
                        prop: options.prop,
                        search: options.search,
                        page: options.page,
                        perPage: options.perPage
                    }
                });
                return {
                    items,
                    total
                }
            }
            if (options.id) {
                const data = await $fetch<Product[]>(`/api/${entity}`, {
                        query: {
                            id: options.id
                        }
                    });
                return { items :data, total: 1}
            }
            if (options.ids) {
                const data = await $fetch<Product[]>(`/api/${entity}`, {
                        query: {
                            ids: options.ids
                        }
                    });
                return { items: data, total: data.length}
            }
            const data = await $fetch<Product[]>(`/api/${entity}`)
            return { items: data, total: data.length}
        },
        async add(item: Product) {
            try {
                const { data, error } = await useFetch<Product>(`/api/${entity}`, {
                    method: 'POST',
                    body: item,
                });
                if (error.value) {
                    throw new Error(error.value.message)
                } else {
                    this.items.push(data.value as Product);
                }
                return data.value
            } catch (e: any) {
                const defaultMessage = `Falha ao cadastrar ${label}`
                showErrorMessage(defaultMessage, e)
            }
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
    },
    getters: {
        byName: (state) => {
            return (name: string) => state.items.filter(p => p.name.includes(name))
        }
    }
})