import { defineEventHandler } from 'h3';
import { ProductStoreService } from '~/server/services/ProductStoreService';

const service = new ProductStoreService();

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id);
  return await service.delete(id);
});
