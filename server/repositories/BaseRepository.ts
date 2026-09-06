import { SqlAdapter } from '@/server/adapters/SqlAdapter';
import { JSONBinAdapter } from '../adapters/JSONBinAdapter';
import type { RepositoryAdapter } from '../adapters/RepositoryAdapter';
import { useRuntimeConfig } from '#imports';

function isSqlEnabled(value: unknown): boolean {
    return value === true || (typeof value === 'string' && value.toLowerCase() === 'true');
}

export class BaseRepository<T extends { id: number }> {
    protected adapter: RepositoryAdapter<T>;

    constructor(entityName: string, useSql?: boolean) {
        const sqlEnabled = useSql ?? isSqlEnabled(useRuntimeConfig().useSql);
        this.adapter = sqlEnabled
            ? new SqlAdapter<T>(entityName)
            : new JSONBinAdapter<T>(entityName);
    }

    async getAll(): Promise<T[]> {
        return this.adapter.getAll();
    }

    async getById(id: number): Promise<T | undefined> {
        return this.adapter.getById(id);
    }

    async add(data: T): Promise<void> {
        await this.adapter.add(data);
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
