import { defineEventHandler, readBody } from 'h3';
import { ProductService } from '~/server/services/ProductService';

const service = new ProductService();

export default defineEventHandler(async (event) => {
  const method = event.method;

  if (method === 'GET') {
    const query = getQuery(event);
    const page = parseInt(query.page as string);
    const perPage = parseInt(query.perPage as string);
    const search = (query.search as string);
    const prop = (query.prop as string || '');
    if (prop) {
      return await service.getPaginated({
        prop, search, page, perPage
      });
    }

    const ids = (query.ids as number[])
    if (ids?.length) {
      return await service.getByIds(ids)
    }

    const id = parseInt(query.id as string)
    if (id) {
      return await service.findById(id)
    }
    return await service.findAll()
  }

  if (method === 'POST') {
    const body = await readBody(event);
    return await service.create(body);
  }

  return { status: 405, message: 'Method not allowed' };
});