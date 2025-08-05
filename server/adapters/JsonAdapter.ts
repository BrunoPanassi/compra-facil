import fs from 'fs/promises';
import path from 'path';

export class JsonAdapter<T extends { id: number }> {
  private readonly filePath: string;

  constructor(entityName: string) {
    this.filePath = path.join(process.cwd(), 'server', 'data', `${entityName}.json`);
  }

  async getAll(): Promise<T[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async getById(id: number): Promise<T | undefined> {
    const all = await this.getAll();
    return all.find(item => item.id === id);
  }

  async getByIds(ids: number[]): Promise<T[]> {
    const data = await this.getAll();
    return data.filter(p => ids.includes(p.id))
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

  async update(id: number, updated: T): Promise<void> {
    const all = await this.getAll();
    const index = all.findIndex(item => item.id === id);
    if (index !== -1) {
      all[index] = updated;
      await this.saveAll(all);
    }
  }

  async delete(id: number): Promise<void> {
    const all = await this.getAll();
    const filtered = all.filter(item => item.id !== id);
    await this.saveAll(filtered);
  }

  async saveAll(data: T[]): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }
}
