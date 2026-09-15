import { validId } from '~/server/utils/validation';
import { apiHandler } from '~/server/utils/api-handler';
import { readBody } from 'h3';
import { ProductStoreService } from '~/server/services/ProductStoreService';


export default apiHandler(async (event) => {
  const service = new ProductStoreService();
  const id = validId(event.context.params?.id);
  const body = await readBody(event);
  return await service.update(id, body);
});