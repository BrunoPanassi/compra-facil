import { defineEventHandler, readBody, getRouterParam } from 'h3';
import { StoreService } from '@/server/services/StoreService';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  const body = await readBody(event);
  const service = new StoreService();
  return service.update(id, body);
});
