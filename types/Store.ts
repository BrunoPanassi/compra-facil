export interface Store {
  id: number;
  name: string;
  street: string;
  nr: number|null;
  neighbr: string;
  city: string;
  state: string;
  zip: number|null;
  lat: number,
  lon: number,
  owner_id: number;
  description: string;
  cellphone: number|null;
  cellphone_second?: number;
  email: string;
  facebook?: string;
  instagram?: string;
  another?: string;
}