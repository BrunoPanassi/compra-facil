import type { DataAdapter } from '~/types/Paginated';
import { BaseRepository } from './BaseRepository';
import type { ProductStore } from '~/types/ProductStore';

export class ProductStoreRepository extends BaseRepository<ProductStore> implements DataAdapter<ProductStore>{

  constructor(useSql: boolean = false) {
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