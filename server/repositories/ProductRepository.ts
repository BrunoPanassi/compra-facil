import { normalizePagination } from '../utils/pagination';
import { searchableProperties } from '../database/queries/pagination';
import type { DataAdapter, Options } from '~/types/Paginated';
import { BaseRepository } from './BaseRepository';
import type { Product } from '~/types/Product';

export class ProductRepository extends BaseRepository<Product> implements DataAdapter<Product>{

  constructor(useSql?: boolean) {
    super('products', useSql)
  }

  async getPaginated(options: Options) {
    const { prop, search, page, perPage } = normalizePagination(options);
    if (this.adapter.getPaginated) return this.adapter.getPaginated(options);
    const data = await this.getAll()
    const filtered = search ?
      data.filter(d => searchableProperties['products'].includes(prop) &&
        (d[prop]?.toString().toLowerCase() || '').includes(search?.toLowerCase()))
      : data

    const offset = (page - 1) * perPage
    return {
      items: filtered.slice(offset, offset + perPage),
      total: filtered.length
    }
  }
}
