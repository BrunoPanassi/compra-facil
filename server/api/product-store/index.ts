import { validId, queryIds } from '~/server/utils/validation';
import { apiHandler } from '~/server/utils/api-handler';
import { readBody } from 'h3';
import { ProductStoreService } from '~/server/services/ProductStoreService';


export default apiHandler(async (event) => {
  const service = new ProductStoreService();
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

    const ids = queryIds(query.ids)
    if (ids?.length) {
      return await service.getByIds([...ids])
    }

    if (query.id !== undefined) {
      const id = validId(query.id)
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