import { createError } from 'h3';
import type { User } from '~/types/User';
import { BaseRepository } from './BaseRepository';


export class UserRepository extends BaseRepository<User> {

  constructor(useSql?: boolean) {
    super('users', useSql)
  }

  async create(user: User): Promise<void> {
    const users = await this.getAll();
    if (users.find(u => u.telefone === user.telefone)) {
      throw createError({ statusCode: 409, message: 'Registro em conflito.' })
    }
    await this.adapter.add(user);
  }

  async findByTelefone(telefone: string): Promise<User | undefined> {
    const users = await this.getAll();
    return users.find(u => u.telefone === telefone);
  }
}
