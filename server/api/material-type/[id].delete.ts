import { validId } from '~/server/utils/validation';
import { apiHandler } from '~/server/utils/api-handler';
import { getRouterParam } from 'h3';
import { MaterialTypeService } from '~/server/services/MaterialTypeService';

export default apiHandler(async (event) => {
  const id = validId(getRouterParam(event, 'id'));
  const service = new MaterialTypeService();
  return service.delete(id);
});
