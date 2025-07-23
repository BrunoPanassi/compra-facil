import { defineEventHandler, readBody } from 'h3';
import { ProductService } from '~/server/services/ProductService';

const service = new ProductService();

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id);
  const body = await readBody(event);
  return await service.update(id, body);
});