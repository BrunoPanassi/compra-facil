import { StoreService } from "~/server/services/StoreService";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const service = new StoreService();
  return await service.create(body);
});