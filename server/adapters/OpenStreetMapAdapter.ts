import type { SearchUrl } from "../../types/SearchAddress";
import { getServerConfig } from '../api/helpers/serverConfig';

export class OpenStreetMapAdapter {

    private readonly config;

    constructor() {
        this.config = getServerConfig()
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