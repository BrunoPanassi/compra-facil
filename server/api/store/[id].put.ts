import { validId } from '~/server/utils/validation';
import { apiHandler } from '~/server/utils/api-handler';
import { readBody, getRouterParam } from 'h3';
import { StoreService } from '@/server/services/StoreService';

export default apiHandler(async (event) => {
  const id = validId(getRouterParam(event, 'id'));
  const body = await readBody(event);
  const service = new StoreService();
  return service.update(id, body);
});
