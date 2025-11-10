import type { User } from '~/types/User';
import { BaseRepository } from './BaseRepository';


export class UserRepository extends BaseRepository<User> {
  
  constructor(useSql: boolean = false) {
    super('users', useSql)
  }

}
