import { defineEventHandler, getRouterParam } from 'h3';
import { StoreService } from '@/server/services/StoreService';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  const service = new StoreService();
  return service.delete(id);
});
