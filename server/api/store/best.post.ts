import { readBody } from 'h3';
import { apiHandler } from '../../utils/api-handler';
import { validateBestStoreSearch } from '../../utils/best-store-validation';
import { StoreService } from '../../services/StoreService';

export default apiHandler(async (event) => {
  const params = validateBestStoreSearch(await readBody<unknown>(event));
  return new StoreService().findBestStores(params);
}, { validateBody: validateBestStoreSearch });
