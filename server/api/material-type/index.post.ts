import { MaterialTypeService } from "~/server/services/MaterialTypeService";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const service = new MaterialTypeService();
  return await service.create(body);
});