import { StoreService } from "~/server/services/StoreService";


export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const owner_id = query.owner_id;

  if (typeof owner_id !== 'number' || !owner_id) {
    return {
      statusCode: 400,
      message: 'Parâmetro "owner_id" é obrigatório e deve ser um number.',
    };
  }

  const storeService = new StoreService();
  const stores = await storeService.findMany({
    where: {
      id: owner_id
    }
  });
  return stores;
});