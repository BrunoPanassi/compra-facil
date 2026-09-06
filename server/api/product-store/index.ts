import { defineEventHandler, readBody } from 'h3';
import { ProductStoreService } from '~/server/services/ProductStoreService';

const service = new ProductStoreService

export default defineEventHandler(async (event) => {
  const method = event.method;

  if (method === 'GET') {
    const query = getQuery(event);
    const page = query.page === undefined ? 1 : Number(query.page);
    const perPage = query.perPage === undefined ? 10 : Number(query.perPage);
    const search = query.search === undefined ? '' : query.search as string;
    const prop = query.prop === undefined ? 'name' : query.prop as string;
    if (query.prop || query.page !== undefined || query.perPage !== undefined || query.search !== undefined) {
      return await service.getPaginated({
        prop, search, page, perPage
      });
    }

    const ids = (query.ids as number[])
    if (ids?.length) {
      return await service.getByIds([...ids])
    }

    const id = Number.parseInt(query.id as string)
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