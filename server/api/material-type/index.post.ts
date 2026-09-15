import { apiHandler } from '~/server/utils/api-handler';
import { MaterialTypeService } from "~/server/services/MaterialTypeService";

export default apiHandler(async (event) => {
  const body = await readBody(event);
  const service = new MaterialTypeService();
  return await service.create(body);
});