export class JSONBinAdapter<T extends { id: number }> {
    private readonly binId: string;
    private baseUrl = "";
    private apiKey = "";

    constructor(binId: string) {
        const config = useRuntimeConfig();
        this.baseUrl = config.public.jsonBinBaseUrl as string
        this.apiKey = config.jsonBinApiKey as string
        this.binId = binId;
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