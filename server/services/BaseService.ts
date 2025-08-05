export class BaseService<T, R extends { getAll: () => Promise<T[]>; getById: (id: number) => Promise<T | undefined>; add: (entity: T) => Promise<void>; update: (id: number, entity: T) => Promise<void>; delete: (id: number) => Promise<void>; getByIds: (id: number[]) => Promise<T[]>; }> {
    constructor(protected repository: R) {}

    async create(store: T): Promise<T> {
        await this.repository.add(store);
        return store;
    }
    
    async findById(id: number): Promise<T | undefined> {
        return this.repository.getById(id);
    }

    async findAll(): Promise<T[]> {
        return this.repository.getAll()
    }

    async update(id: number, updated: T): Promise<T> {
        await this.repository.update(id, updated);
        return updated;
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }

    async getByIds(ids: number[]): Promise<T[]> {
        return await this.repository.getByIds(ids);
    }
}