
import type { User } from '@/types/User';
import { UserRepository } from '../repositories/UserRepository';
import bcrypt from 'bcrypt';
import { BaseService } from './BaseService';

export class UserService extends BaseService<User, UserRepository> {
  
  constructor(repo: UserRepository = new UserRepository()) {
    super(repo);
  }

  async register(user: User): Promise<User> {
    user.senha = await bcrypt.hash(user.senha, 10);
    await this.repository.register(user);
    return user;
  }

  async login(telefone: string, senha: string) {
    return this.repository.login(telefone, senha)
  }
}
