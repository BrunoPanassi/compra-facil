import { defineEventHandler } from 'h3';
import { MaterialTypeService } from '~/server/services/MaterialTypeService';

export default defineEventHandler(async () => {
  const service = new MaterialTypeService();
  return service.findAll();
});
