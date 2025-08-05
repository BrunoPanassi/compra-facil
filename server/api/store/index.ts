import { defineEventHandler } from 'h3';
import { StoreService } from '@/server/services/StoreService';

const service = new StoreService();

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const ids = (query.ids as number[] || [])
  if (ids.length) {
    return service.getByIds(ids)
  }
  return service.findAll();
});
