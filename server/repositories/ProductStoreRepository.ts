import { BaseRepository } from './BaseRepository';
import type { ProductStore } from '~/types/ProductStore';

export class ProductStoreRepository extends BaseRepository<ProductStore> {

  constructor(useSql: boolean = false) {
    super('product-store', useSql)
  }
}