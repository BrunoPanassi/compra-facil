import type { Material } from '~/types/Material';
import { BaseRepository } from './BaseRepository';

export class MaterialRepository extends BaseRepository<Material> {
  constructor(useSql: boolean = false) {
        super('materials', useSql)
    }
}