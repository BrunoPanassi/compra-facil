import { GoogleMapsAdapter } from "../adapters/GoogleMapsAdapter";
import { OpenStreetMapAdapter } from "../adapters/OpenStreetMapAdapter";
import { PhotonAdapter } from "../adapters/PhotonAdapter";

export class SearchAddress {

    private readonly config;
    protected searchAddressClass: OpenStreetMapAdapter | GoogleMapsAdapter | PhotonAdapter;


    constructor() {
        this.config = useRuntimeConfig();
        let useGoogleMapsSearchAddress = this.config.useGoogleMapsSearchAddress === 'true';
        let useOpenStreetMapSearchAddress = this.config.useOpenStreetMapSearchAddress === 'true';
        let usePhotonMapSearchAddress = this.config.usePhotonMapSearchAddress === 'true';

        if (useGoogleMapsSearchAddress) {
            this.searchAddressClass = new GoogleMapsAdapter()
        }
        if (useOpenStreetMapSearchAddress) {
            this.searchAddressClass = new OpenStreetMapAdapter()
        }
        if (usePhotonMapSearchAddress) {
            this.searchAddressClass = new PhotonAdapter()
        }
        this.searchAddressClass = new PhotonAdapter();
    }

    getUrl(query: string) {
        return this.searchAddressClass.getUrl(query);
    }

    
}