
import { createClient } from '@supabase/supabase-js'

import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { Role } from '../../types/Role';
import { prisma } from '../util/prisma';

export class PrismaAdapter<T extends { id: number, [key:string]: string|number }> {
  model: any
  supabase: ReturnType<typeof createClient>

  constructor(modelName: keyof typeof prisma) {
    this.model = prisma[modelName]
    this.supabase = createClient(
      'https://tkidlfsnvlagjxdnrlkq.supabase.co', 
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRraWRsZnNudmxhZ2p4ZG5ybGtxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEwNTQ2OSwiZXhwIjoyMDc1NjgxNDY5fQ.wQ70cCYxAc_dsbCL2fVkVvtEVzqSzN0Qt6Si7rcXu-c'
    )
  }

  getById(id: number) { return this.model.findUnique({ 
    where: {
        id: id
  } })}
  getByIds(ids: number[]) { return this.model.findUnique({ 
    where: {
        ids: ids
  } })}
  getAll() {
    return this.model.findMany()
  }
  async getPaginated({
    prop = 'name',
    search = '',
    page = 1,
    perPage = 10
  }) {
    const data: T[] = await this.getAll()
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
  findOne(where: any) { return this.model.findUnique({ where }) }
  findMany(q?: any) { return this.model.findMany(q) }
  add(data: any) { return this.model.create({ data }) }
  update(where: any, data: any) { return this.model.update({ where, data }) }
  delete(where: any) { return this.model.delete({ where }) }

  async register(item: T) {
    const telefone = item.telefone as string
    const senha = item.senha as string
    const nome = item.nome as string
    const role = item.role as Role
    const res = await this.model.findUnique({ where: { telefone }});
    if (res?.error) throw new Error(res.error.message)
    if (res) throw new Error('Telefone já cadastrado');

    await this.model.create({ 
      id: randomUUID(),
      telefone: telefone,
      nome,
      role,
      senha
    })
  }

  async login(telefone: string, senha: string) {
    const user = await this.model.findUnique({ where: { telefone }});
    const userSenha = user?.senha as string
    if (!user || !(await bcrypt.compare(senha, userSenha))) {
      throw new Error('Credenciais inválidas');
    }
    return user;// contém session e user
  }
}
