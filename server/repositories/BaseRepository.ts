import { JsonAdapter } from '@/server/adapters/JsonAdapter';
import { PrismaAdapter } from '../adapters/PrismaAdapter';
import { Options } from '~/types/Paginated';

export class BaseRepository<T extends { id: number }> {
    protected adapter: JsonAdapter<T> | PrismaAdapter<T>;
    
    constructor(entityName: string, useSql: boolean = false) {
    this.adapter = useSql
        ? new PrismaAdapter<T>(entityName)
        : new JsonAdapter<T>(entityName);
    }

    async getAll(): Promise<T[]> {
        return this.adapter.getAll();
    }

    async register(item: T) {
        return this.adapter.register(item)
    }

    async login(telefone: string, senha: string) {
        return this.adapter.login(telefone, senha)
    }

    async findOne(item: Object) {
        return this.adapter.findOne(item)
    }

    async findMany(item: Object) {
        return this.adapter.findMany(item)
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

    async getPaginated(options: Options) {
        return await this.adapter.getPaginated(options)
    }
}