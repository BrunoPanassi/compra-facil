export interface Store {
  id: number;
  name: string;
  street: string;
  nr: number;
  neighbr: string;
  city: string;
  state: string;
  zip: number;
  lat: number,
  lon: number,
  owner_id: number;
  description: string;
  cellphone: number;
  cellphone_second?: number;
  email: string;
  facebook?: string;
  instagram?: string;
  another?: string;
}