import { SqlAdapter } from '../adapters/SqlAdapter';
import { getProductStoresByStore } from '../database/queries/product-store';
import { ProductRepository } from './ProductRepository';
import type { ProductStoreWithProduct } from '../../types/ProductStore';
import { normalizePagination, validateStoreId } from '../utils/pagination';
import { searchableProperties } from '../database/queries/pagination';
import type { DataAdapter, Options } from '~/types/Paginated';
import { BaseRepository } from './BaseRepository';
import type { ProductStore } from '~/types/ProductStore';

export class ProductStoreRepository extends BaseRepository<ProductStore> implements DataAdapter<ProductStore>{

  constructor(useSql?: boolean) {
    super('product-store', useSql)
  }

  async getPaginated(options: Options) {
    const { prop, search, page, perPage } = normalizePagination(options);
    if (this.adapter.getPaginated) return this.adapter.getPaginated(options);
    const data = await this.getAll()
    const filtered = search ?
      data.filter(d => searchableProperties['product-store'].includes(prop) &&
        (d[prop]?.toString().toLowerCase() || '').includes(search?.toLowerCase()))
      : data

    const offset = (page - 1) * perPage
    return {
      items: filtered.slice(offset, offset + perPage),
      total: filtered.length
    }
  }

  async getByStore(storeId: number): Promise<ProductStoreWithProduct[]> {
    validateStoreId(storeId);
    if (this.adapter instanceof SqlAdapter) return getProductStoresByStore(storeId);
    const associations = (await this.getAll()).filter(row => row.id_store == storeId);
    if (!associations.length) return [];
    const products = await new ProductRepository(false).getByIds(associations.map(row => row.id_product));
    const byId = new Map(products.map(product => [Number(product.id), product]));
    return associations.flatMap(row => {
      const product = byId.get(Number(row.id_product));
      return product ? [{ ...row, product }] : [];
    });
  }
}
