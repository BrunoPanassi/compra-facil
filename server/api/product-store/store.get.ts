import { validateStoreId } from '../../utils/pagination';
import { ProductStoreService } from "~/server/services/ProductStoreService";

export default defineEventHandler(async (event) => {
    const query = getQuery(event)

    const store_id = typeof query.store_id === 'string' ? Number(query.store_id) : NaN
    validateStoreId(store_id)
    const productStoreService = new ProductStoreService();
    const products = await productStoreService.getByStore(store_id)
    return products;
})