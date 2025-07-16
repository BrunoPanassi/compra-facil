import type { ProductStore } from './ProductStore';

export interface Order {
  id: number;
  id_product_store: ProductStore;
  quantity: number;
  value: number;
  // De qual loja o produto veio, e qual a sua quantidade e valor
}