import { SqlAdapter } from '@/server/adapters/SqlAdapter';
import { JSONBinAdapter } from '../adapters/JSONBinAdapter';

export class BaseRepository<T extends { id: number }> {
    protected adapter: JSONBinAdapter<T> | SqlAdapter<T>;

    private readonly tableJsonBinIds = [
        {
            "table": "users",
            "binId": '6912585e43b1c97be9a57673'
        },
                {
            "table": "stores",
            "binId": '6912588c43b1c97be9a576b4'
        },
                {
            "table": "products",
            "binId": '691258eed0ea881f40e06d73'
        },
                {
            "table": "materials",
            "binId": '69125914d0ea881f40e06da8'
        },
                {
            "table": "material-types",
            "binId": '691259d543b1c97be9a5785b'
        },
                {
            "table": "product-store",
            "binId": '69125a71d0ea881f40e06f3a'
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