import type { RepositoryAdapter } from './RepositoryAdapter';

export class JSONBinAdapter<T extends { id: number }> implements RepositoryAdapter<T> {
    private readonly binId: string;
    private baseUrl = "";
    private apiKey = "";

    constructor(entityName: string) {
        const binId = this.findBinId(entityName)
        const config = useRuntimeConfig();
        this.baseUrl = config.public.jsonBinBaseUrl as string
        this.apiKey = config.jsonBinApiKey as string
        this.binId = binId;
    }

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

    findBinId(table: string) {
        return this.tableJsonBinIds.find(val => val.table == table)?.binId ?? ''
    }

    private get headers() {
        return {
            'Content-Type': 'application/json',
            'X-Master-Key': this.apiKey
        };
    }

    async getAll(): Promise<T[]> {
        const data = await $fetch(`${this.baseUrl}/${this.binId}/latest`, {
            headers: this.headers
        });
        return data.record ?? [];
    }

    async getById(id: number): Promise<T | undefined> {
        const all = await this.getAll();
        return all.find(item => item.id === id);
    }

    async getByIds(ids: number[]): Promise<T[]> {
        const data = await this.getAll();
        return data.filter(p => ids.includes(p.id))
    }

    async saveAll(items: T[]): Promise<void> {
        await $fetch(`${this.baseUrl}/${this.binId}`, {
            method: 'PUT',
            headers: this.headers,
            body: items
        });
    }

    async add(item: T): Promise<void> {
        const all = await this.getAll();
        if (all.length) {
            let last = all[all.length - 1]
            item.id = last.id + 1
        } else {
            item.id = 1
        }
        all.push(item);
        await this.saveAll(all);
    }

    async update(id: number, data: Partial<T>): Promise<T | null> {
        const all = await this.getAll();
        const idx = all.findIndex((x: any) => x.id === id);
        if (idx === -1) return null;
        all[idx] = { ...all[idx], ...data };
        await this.saveAll(all);
        return all[idx];
    }

    async delete(id: number): Promise<boolean> {
        const all = await this.getAll();
        const filtered = all.filter((x: any) => x.id !== id);
        await this.saveAll(filtered);
        return filtered.length < all.length;
    }
}
