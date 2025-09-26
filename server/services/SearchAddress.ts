import { GoogleMapsAdapter } from "../adapters/GoogleMapsAdapter";
import { OpenStreetMapAdapter } from "../adapters/OpenStreetMapAdapter";

export class SearchAddress {

    private readonly config;
    protected searchAddressClass: OpenStreetMapAdapter | GoogleMapsAdapter;


    constructor() {
        this.config = useRuntimeConfig();
        let useGoogleMapsSearchAddress = this.config.useGoogleMapsSearchAddress === 'true';
        if (useGoogleMapsSearchAddress) {
            this.searchAddressClass = new GoogleMapsAdapter()
        }
        this.searchAddressClass = new OpenStreetMapAdapter();
    }

    getUrl(query: string) {
        return this.searchAddressClass.getUrl(query);
    }

    
}