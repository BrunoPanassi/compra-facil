import { defineEventHandler } from 'h3';
import { StoreService } from '@/server/services/StoreService';

export default defineEventHandler(async () => {
  const service = new StoreService();
  return service.findAll();
});
