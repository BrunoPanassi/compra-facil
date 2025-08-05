import { defineEventHandler, readBody } from 'h3';
import { ProductStoreService } from '~/server/services/ProductStoreService';

const service = new ProductStoreService

export default defineEventHandler(async (event) => {
  const method = event.method;

  if (method === 'GET') {
    const query = getQuery(event);
    const page = parseInt(query.page as string || '1');
    const perPage = parseInt(query.perPage as string || '10');
    const search = (query.search as string) || '';
    const prop = (query.prop as string) || 'name';
    return await service.getPaginated({
      prop, search, page, perPage
    });
  }

  if (method === 'POST') {
    const body = await readBody(event);
    return await service.create(body);
  }

  return { status: 405, message: 'Method not allowed' };
});