import { validId } from '~/server/utils/validation';
import { apiHandler } from '~/server/utils/api-handler';
import { readBody, getRouterParam } from 'h3';
import { MaterialTypeService } from '~/server/services/MaterialTypeService';

export default apiHandler(async (event) => {
  const id = validId(getRouterParam(event, 'id'));
  const body = await readBody(event);
  const service = new MaterialTypeService();
  return service.update(id, body);
});
