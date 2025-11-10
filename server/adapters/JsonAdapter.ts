import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt';
export class JsonAdapter<T extends { id: number, [key:string]: string|number }> {
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

  async findOne(propAndValue: any) {
    const prop = Object.keys(propAndValue)[0]
    const value = Object.values(propAndValue)[0]
    const data = await this.getAll();
    return data.find(d => d[prop] == value)
  }

  async findMany(propAndValue?: any) {
    if (propAndValue) {
      const { prop, value } = propAndValue
      const data = await this.getAll();
      return data.filter(d => d[prop] == value)
    }
    return await this.getAll();
  }
    

  async getPaginated({
    prop = 'name',
    search = '',
    page = 1,
    perPage = 10
  }) {
    const data = await this.getAll()
    const filtered = search ? 
      data.filter(d => 
        (d[prop]?.toString().toLowerCase() || '').includes(search?.toLowerCase()))
      : data

    const offset = (page - 1) * perPage
    return {
      items: filtered.slice(offset, offset + perPage),
      total: filtered.length
    }
  }

  async register(item: T) {
    const data = await this.findOne({prop: 'telefone', value: item.telefone as string})
    if (data) {
      throw new Error('Usuário já cadastrado com esse telefone!')
    }
    
    await this.add(item);
  }

  async login(telefone: string, senha: string) {
    const user = await this.findOne({prop: 'telefone', value: telefone})
    const userSenha = user?.senha as string
    if (!user || !(await bcrypt.compare(senha, userSenha))) {
      throw new Error('Credenciais inválidas');
    }
    return user;
  }
}
