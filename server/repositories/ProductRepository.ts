import type { DataAdapter } from '~/types/Paginated';
import { BaseRepository } from './BaseRepository';
import type { Product } from '~/types/Product';

export class ProductRepository extends BaseRepository<Product> implements DataAdapter<Product>{

  constructor(useSql?: boolean) {
    super('products', useSql)
  }

  async getPaginated({
    prop = 'name',
    search = '',
    page = 1,
    perPage = 10
  }) {
    const data = await this.getAll()
    const filtered = search ? 
      data.filter(d => 
        (d[prop]?.toString().toLowerCase() || '').includes(search?.toLowerCase()))
      : data

    const offset = (page - 1) * perPage
    return {
      items: filtered.slice(offset, offset + perPage),
      total: filtered.length
    }
  }
}
