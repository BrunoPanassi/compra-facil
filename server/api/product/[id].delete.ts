import { validId } from '~/server/utils/validation';
import { apiHandler } from '~/server/utils/api-handler';
import { ProductService } from '~/server/services/ProductService';


export default apiHandler(async (event) => {
  const service = new ProductService();
  const id = validId(event.context.params?.id);
  return await service.delete(id);
});
