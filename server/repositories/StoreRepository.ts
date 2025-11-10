import type { Store } from '~/types/Store';
import { BaseRepository } from './BaseRepository';

export class StoreRepository extends BaseRepository<Store>{

  constructor(useSql: boolean = false) {
    super('stores', useSql)
  }
}