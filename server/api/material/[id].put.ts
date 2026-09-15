import { validId } from '~/server/utils/validation';
import { apiHandler } from '~/server/utils/api-handler';
import { readBody } from 'h3';
import { MaterialService } from '~/server/services/MaterialService';


export default apiHandler(async (event) => {
  const service = new MaterialService();
  const id = validId(event.context.params?.id);
  const body = await readBody(event);
  return await service.update(id, body);
});