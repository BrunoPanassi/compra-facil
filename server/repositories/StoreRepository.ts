import { createError } from 'h3';
import { SqlAdapter } from '../adapters/SqlAdapter';
import { findBestStores } from '../database/queries/best-stores';
import type { BestStoreQueryParams } from '../../types/BestStore';
import type { Store } from '~/types/Store';
import { BaseRepository } from './BaseRepository';

export class StoreRepository extends BaseRepository<Store>{

  constructor(useSql?: boolean) {
    super('stores', useSql)
  }

  async findBestStores(params: BestStoreQueryParams) {
    if (!(this.adapter instanceof SqlAdapter)) throw createError({ statusCode: 503 });
    return findBestStores(params);
  }

  async findByOwner(owner_id: number): Promise<Store | undefined> {
    const stores = await this.getAll();
    return stores.find(u => u.owner_id === owner_id);
  }
}
