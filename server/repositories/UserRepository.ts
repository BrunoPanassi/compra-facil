import type { User } from '~/types/User';
import { BaseRepository } from './BaseRepository';


export class UserRepository extends BaseRepository<User> {
  
  constructor(useSql: boolean = false) {
    super('users', useSql)
  }

  async create(user: User): Promise<void> {
    const users = await this.getAll();
    if (users.find(u => u.telefone === user.telefone)) {
      throw new Error('Usuário já cadastrado com esse telefone!')
    }
    await this.adapter.add(user);
  }

  async findByTelefone(telefone: string): Promise<User | undefined> {
    const users = await this.getAll();
    return users.find(u => u.telefone === telefone);
  }
}
