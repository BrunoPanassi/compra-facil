import type { Options, Response } from '../../types/Paginated';
export interface RepositoryAdapter<T extends { id: number }> {
  getPaginated?(options: Options): Promise<Response<T>>;
  getAll(): Promise<T[]>;
  getById(id: number): Promise<T | undefined>;
  getByIds(ids: number[]): Promise<T[]>;
  add(item: T): Promise<void>;
  update(id: number, data: Partial<T>): Promise<T | null>;
  delete(id: number): Promise<boolean>;
}
