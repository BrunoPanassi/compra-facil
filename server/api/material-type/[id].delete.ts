import { defineEventHandler, getRouterParam } from 'h3';
import { MaterialTypeService } from '~/server/services/MaterialTypeService';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  const service = new MaterialTypeService();
  return service.delete(id);
});
