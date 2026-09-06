export interface Address {
  id: number, 
  name: string,
  lat: number,
  lon: number,
  postcode: string,
  district: string,
  street: string,
  city: string,
  state: string
}

export interface Coordinates {
  lat: number,
  lon: number, 
  display_name: string
}

export interface AddressCoordinates {
  address: Address|null,
  coordinates: Coordinates
}