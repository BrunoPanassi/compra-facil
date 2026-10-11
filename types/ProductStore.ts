import type { Product } from "./Product";
export type { BestStoreResult } from "./BestStore";

export interface ProductStore {
  id: number;
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
  requestedQuantity?: number;
  availableQuantity?: number;
  subtotal?: string;
  name: string;
  brand: string
  desc?: string;
  material_id: number;
  images: string[];
}

export interface ProductStoreWithProduct extends ProductStore {
  product: Product;
}
