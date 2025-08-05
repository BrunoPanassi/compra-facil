import { JsonAdapter } from '@/server/adapters/JsonAdapter';
import { SqlAdapter } from '@/server/adapters/SqlAdapter';

export class BaseRepository<T extends { id: number }> {
    protected adapter: JsonAdapter<T> | SqlAdapter<T>;
    
    constructor(entityName: string, useSql: boolean = false) {
    this.adapter = useSql
        ? new SqlAdapter<T>(entityName)
        : new JsonAdapter<T>(entityName);
    }

    async getAll(): Promise<T[]> {
        return this.adapter.getAll();
    }

    async getById(id: number): Promise<T | undefined> {
        return this.adapter.getById(id);
    }

    async add(store: T): Promise<void> {
        await this.adapter.add(store);
    }

    async update(id: number, updated: T): Promise<void> {
        await this.adapter.update(id, updated);
    }

    async delete(id: number): Promise<void> {
        await this.adapter.delete(id);
    }

    async getByIds(ids: number[]): Promise<T[]> {
        return await this.adapter.getByIds(ids)
    }
}