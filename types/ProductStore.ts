import type { Product } from "./Product";

export interface ProductStore {
  id: number;
  [key:string]: string|number;
  id_store: number;
  id_product: number;
  price: string;
  quantity: number;
  // Qual produto cada loja contém
}

export interface ProductStoreDataTable {
  id: number;
  id_store: number;
  product: Product;
  price: string;
  quantity: number;
}