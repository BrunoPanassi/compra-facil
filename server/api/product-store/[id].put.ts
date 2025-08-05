import { defineEventHandler, readBody } from 'h3';
import { ProductStoreService } from '~/server/services/ProductStoreService';

const service = new ProductStoreService();

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id);
  const body = await readBody(event);
  return await service.update(id, body);
});