import { defineEventHandler } from 'h3';
import { MaterialService } from '~/server/services/MaterialService';

const service = new MaterialService();

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id);
  return await service.delete(id);
});
