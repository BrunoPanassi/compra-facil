import { getServerConfig } from '../api/helpers/serverConfig';

export class OpenStreetMapService {

    private readonly config;

    constructor() {
        this.config = getServerConfig()
    }
    
    getUrl(query: string) {
        let url = this.config.openStreetMapUrl;
        return url.replace('(PARAM)', encodeURIComponent(query))
    }
}