import { UserService } from '../../services/UserService';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const service = new UserService();
  return await service.register(body);
});
