import { ProductStoreService } from "~/server/services/ProductStoreService";

export default defineEventHandler(async (event) => {
    const query = getQuery(event)

    const store_id = parseInt(query.store_id as string)
    if (typeof store_id !== 'number' || !store_id) {
        return {
        statusCode: 400,
        message: 'Parâmetro "store_id" é obrigatório e deve ser um number.',
        };
    }
    const productStoreService = new ProductStoreService();
    const products = await productStoreService.getByStore(store_id)
    return products;
})