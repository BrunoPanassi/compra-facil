export class PhotonMapService {

    private readonly config;

    constructor() {
        this.config = useRuntimeConfig()
    }
    
    getUrl(query: string) {
        let url = this.config.photonMapUrl as string;
        return url.replace('(PARAM)', encodeURIComponent(query))
    }
}