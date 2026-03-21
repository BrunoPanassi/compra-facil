export const useLoadingStore = defineStore('loading-router', {
    state: () => ({
        loading: false as boolean
    }),
    actions: {
        updateLoading(value: boolean) {
            this.loading = value
        }
    },
    getters: {
        getLoading: (state) => {
            return () => state.loading
        }
    }
})