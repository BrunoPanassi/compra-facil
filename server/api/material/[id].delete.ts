import { validId } from '~/server/utils/validation';
import { apiHandler } from '~/server/utils/api-handler';
import { MaterialService } from '~/server/services/MaterialService';


export default apiHandler(async (event) => {
  const service = new MaterialService();
  const id = validId(event.context.params?.id);
  return await service.delete(id);
});
