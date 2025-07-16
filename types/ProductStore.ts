
import { type Product } from './Product';
import type { Store } from './Store';

export interface ProductStore {
  id: number;
  id_store: Store;
  id_product: Product;
  // Qual produto cada loja contém
}