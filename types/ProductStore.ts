import type { Product } from "./Product";
import type { Store } from "./Store";

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

export interface ProdutStoreProductDetail {
  id_store: number;
  id_product: number;
  price: string;
  quantity: number;
  name: string;
  brand: string
  desc?: string;
  material_id: number;
  images: string[];
}

export interface BestStoreResult {
  store: Store;
  totalPrice: number;
  distance: number;
  foundProducts: ProdutStoreProductDetail[];
  missingProducts: Product[];
  score: number;
}