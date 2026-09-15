import { apiHandler } from '~/server/utils/api-handler';
import { MaterialTypeService } from '~/server/services/MaterialTypeService';

export default apiHandler(async () => {
  const service = new MaterialTypeService();
  return service.findAll();
});
