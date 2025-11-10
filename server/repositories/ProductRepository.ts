import { BaseRepository } from './BaseRepository';
import type { Product } from '~/types/Product';

export class ProductRepository extends BaseRepository<Product> {

  constructor(useSql: boolean = false) {
    super('products', useSql)
  }
}