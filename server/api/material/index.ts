import { defineEventHandler, readBody } from 'h3';
import { MaterialService } from '~/server/services/MaterialService';

const service = new MaterialService();

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