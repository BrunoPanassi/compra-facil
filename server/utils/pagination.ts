import { createError } from 'h3';
import type { Options } from '../../types/Paginated';

export function normalizePagination(options: Options) {
  const { page = 1, perPage = 10, search = '', prop = 'name' } = options;
  if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(perPage) || perPage < 1 ||
      !Number.isSafeInteger((page - 1) * perPage) || typeof search !== 'string' || typeof prop !== 'string') {
    throw createError({ statusCode: 400, message: 'Parâmetros de paginação inválidos.' });
  }
  return { page, perPage, search, prop, offset: (page - 1) * perPage };
}

export function validateStoreId(id: number) {
  if (!Number.isSafeInteger(id) || id <= 0 || id > 2147483647) {
    throw createError({ statusCode: 400, message: 'store_id deve ser um inteiro positivo válido.' });
  }
}
