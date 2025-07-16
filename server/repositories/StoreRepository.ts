import type { Store } from '~/types/Store';
import { BaseRepository } from './BaseRepository';

export class StoreRepository extends BaseRepository<Store>{

  constructor(useSql: boolean = false) {
    super('stores', useSql)
  }

  async findByOwner(owner_id: number): Promise<Store | undefined> {
    const stores = await this.getAll();
    return stores.find(u => u.owner_id === owner_id);
  }
}