import { defineEventHandler, readBody, getRouterParam } from 'h3';
import { MaterialTypeService } from '~/server/services/MaterialTypeService';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  const body = await readBody(event);
  const service = new MaterialTypeService();
  return service.update(id, body);
});
