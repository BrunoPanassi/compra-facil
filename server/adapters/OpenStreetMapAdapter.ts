import type { SearchUrl } from "~/types/SearchAddress";

export class OpenStreetMapAdapter {

    private readonly config;

    constructor() {
        this.config = useRuntimeConfig()
    }
    
    async getUrl(query: string): Promise<SearchUrl> {
        const data = await $fetch<string>('/api/search-address/open-street-map-url', {
            query: {
                search: query
            }
        });
        return { url: data}
    }
}