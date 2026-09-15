
import { createError } from 'h3';
import { publicUser } from '../utils/public-user';
import type { User, PublicUser } from '@/types/User';
import { UserRepository } from '../repositories/UserRepository';
import bcrypt from 'bcrypt';
import { BaseService } from './BaseService';

export class UserService extends BaseService<User, UserRepository> {
  
  constructor(repo: UserRepository = new UserRepository()) {
    super(repo);
  }

  async register(user: User): Promise<PublicUser> {
    user.senha = await bcrypt.hash(user.senha, 10);
    await this.repository.create(user);
    return publicUser(user);
  }

  async login(telefone: string, senha: string): Promise<PublicUser> {
    const user = await this.repository.findByTelefone(telefone);
    if (!user || !(await bcrypt.compare(senha, user.senha))) {
      throw createError({ statusCode: 401, message: 'Telefone ou senha inválidos.' });
    }
    return publicUser(user);
  }
}
