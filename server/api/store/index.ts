import { queryIds } from '~/server/utils/validation';
import { apiHandler } from '~/server/utils/api-handler';
import { StoreService } from '@/server/services/StoreService';


export default apiHandler(async (event) => {
  const service = new StoreService();
  const query = getQuery(event)
  const ids = queryIds(query.ids)
  if (ids.length) {
    return service.getByIds(ids)
  }
  return service.findAll();
});
