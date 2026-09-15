import { validId } from '~/server/utils/validation';
import { apiHandler } from '~/server/utils/api-handler';
import { readBody } from 'h3';
import { ProductService } from '~/server/services/ProductService';


export default apiHandler(async (event) => {
  const service = new ProductService();
  const id = validId(event.context.params?.id);
  const body = await readBody(event);
  return await service.update(id, body);
});