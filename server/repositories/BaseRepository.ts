import { SqlAdapter } from '@/server/adapters/SqlAdapter';
import { JSONBinAdapter } from '../adapters/JSONBinAdapter';

export class BaseRepository<T extends { id: number }> {
    protected adapter: JSONBinAdapter<T> | SqlAdapter<T>;

    private readonly tableJsonBinIds = [
        {
            "table": "users",
            "binId": process.env.JSONBIN_USERS_ID ?? ''
        },
                {
            "table": "stores",
            "binId": process.env.JSONBIN_STORES_ID ?? ''
        },
                {
            "table": "products",
            "binId": process.env.JSONBIN_PRODUCTS_ID ?? ''
        },
                {
            "table": "materials",
            "binId": process.env.JSONBIN_MATERIALS_ID ?? ''
        },
                {
            "table": "material-types",
            "binId": process.env.JSONBIN_MATERIAL_TYPES_ID ?? ''
        },
                {
            "table": "product-store",
            "binId": process.env.JSONBIN_PRODUCT_STORES_ID ?? ''
        }
    ]
    
    constructor(entityName: string, useSql: boolean = false) {
    this.adapter = useSql
        ? new SqlAdapter<T>(entityName)
        : new JSONBinAdapter<T>(this.findBinId(entityName));
    }

    findBinId(table: string) {
        return this.tableJsonBinIds.find(val => val.table == table)?.binId ?? ''
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