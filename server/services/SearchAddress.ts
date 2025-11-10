import { GoogleMapsAdapter } from "../adapters/GoogleMapsAdapter";
import { OpenStreetMapAdapter } from "../adapters/OpenStreetMapAdapter";
import { getServerConfig } from '../api/helpers/serverConfig';

export class SearchAddress {

    private readonly config;
    protected searchAddressClass: OpenStreetMapAdapter | GoogleMapsAdapter;


    constructor() {
        this.config = getServerConfig();
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