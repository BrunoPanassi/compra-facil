import { validId } from '~/server/utils/validation';
import { apiHandler } from '~/server/utils/api-handler';
import { StoreService } from "~/server/services/StoreService";


export default apiHandler(async (event) => {
  const query = getQuery(event);
  const owner_id = validId(query.owner_id);

  const storeService = new StoreService();
  const stores = await storeService.findByOwner(owner_id);
  return stores;
});