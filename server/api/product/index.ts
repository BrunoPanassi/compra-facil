import { defineEventHandler, readBody } from 'h3';
import { ProductService } from '~/server/services/ProductService';

const service = new ProductService();

export default defineEventHandler(async (event) => {
  const method = event.method;

  if (method === 'GET') {
    return await service.findAll();
  }

  if (method === 'POST') {
    const body = await readBody(event);
    return await service.create(body);
  }

  return { status: 405, message: 'Method not allowed' };
});