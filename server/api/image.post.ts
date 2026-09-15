import { readBody, createError } from 'h3';
import { apiHandler } from '../utils/api-handler';

export default apiHandler(async event => {
  const body = await readBody<{ image?: unknown }>(event);
  if (typeof body?.image !== 'string' || body.image.length > 2_000_000) {
    throw createError({ statusCode: 400 });
  }
  const key = process.env.IMAGE_HOSTING_API_KEY;
  if (!key) throw createError({ statusCode: 503 });
  const form = new FormData();
  form.append('image', body.image.split(',').pop() || '');
  const response = await $fetch<{ data: { url: string } }>('https://api.imgbb.com/1/upload', {
    method: 'POST', query: { key }, body: form,
  });
  return { url: response.data.url };
});
