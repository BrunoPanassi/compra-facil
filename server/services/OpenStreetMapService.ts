export class OpenStreetMapService {

    private readonly config;

    constructor() {
        this.config = useRuntimeConfig()
    }
    
    getUrl(query: string) {
        let url = this.config.openStreetMapUrl;
        return url.replace('(PARAM)', encodeURIComponent(query))
    }
}