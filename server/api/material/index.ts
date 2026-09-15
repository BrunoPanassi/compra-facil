import { apiHandler } from '~/server/utils/api-handler';
import { readBody } from 'h3';
import { MaterialService } from '~/server/services/MaterialService';


export default apiHandler(async (event) => {
  const service = new MaterialService();
  const method = event.method;

  if (method === 'GET') {
    return await service.findAll();
  }

  if (method === 'POST') {
    const body = await readBody(event);
    return await service.create(body);
  }

  return { status: 405, message: 'Method not allowed' };
});