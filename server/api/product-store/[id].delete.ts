import { validId } from '~/server/utils/validation';
import { apiHandler } from '~/server/utils/api-handler';
import { ProductStoreService } from '~/server/services/ProductStoreService';


export default apiHandler(async (event) => {
  const service = new ProductStoreService();
  const id = validId(event.context.params?.id);
  return await service.delete(id);
});
