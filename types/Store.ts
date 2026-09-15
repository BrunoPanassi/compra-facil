export interface Store {
  id: number;
  name: string;
  street: string;
  nr: number|null;
  neighbr: string;
  city: string;
  state: string;
  zip: string|null;
  lat: number,
  lon: number,
  owner_id: number;
  description: string;
  cellphone: string|null;
  cellphone_second?: string;
  email: string;
  facebook?: string;
  instagram?: string;
  another?: string;
}