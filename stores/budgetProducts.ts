import { SelectedProduct } from "~/types/Product"

export const useBudgetProductsStore = defineStore('budgetProducts', {
    state: () => ({
        products: [] as Array<SelectedProduct>
    }),
    actions: {
        async update(products: Array<SelectedProduct>) {
            this.products = products
        },
        async push(products: Array<SelectedProduct>) {
            this.products.push(...products)
        },
        async clear() {
            this.products.splice(0, this.products.length)
        }
    },
    getters: {
        getProducts: (state) => {
            return () => state.products
        },
        getTotal: (state) => {
            return () => state.products.reduce((total, p) => total + p.quantity, 0)
        }
    }
})