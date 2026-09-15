import { apiHandler } from '~/server/utils/api-handler';
import { UserService } from '../../services/UserService';

export default apiHandler(async (event) => {
  const body = await readBody(event);
  const service = new UserService();
  return await service.register(body);
});
