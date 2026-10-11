import type { BestStoreSearchParams } from '../../types/BestStore';
import { invalidInput } from './validation';

export const MAX_SEARCH_PRODUCTS = 100;
export const MAX_REQUESTED_QUANTITY = 2147483647;
export function validateBestStoreSearch(body: unknown): BestStoreSearchParams {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return invalidInput();
  const { products, latitude, longitude, priority } = body as Record<string, unknown>;
  let { maxDistanceKm } = body as Record<string, unknown>;
  if (!Array.isArray(products) || !products.length || products.length > MAX_SEARCH_PRODUCTS) return invalidInput();
  const ids = new Set<number>();
  const requested = products.map((item: unknown) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return invalidInput();
    const { productId, quantity } = item as Record<string, unknown>;
    for (const value of [productId, quantity]) {
      if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > MAX_REQUESTED_QUANTITY) return invalidInput();
    }
    if (ids.has(productId as number)) return invalidInput();
    ids.add(productId as number);
    return { productId: productId as number, quantity: quantity as number };
  });
  if (typeof latitude !== 'number' || !Number.isFinite(latitude) || Math.abs(latitude) > 90) return invalidInput();
  if (typeof longitude !== 'number' || !Number.isFinite(longitude) || Math.abs(longitude) > 180) return invalidInput();
  if (priority !== 'price' && priority !== 'distance') return invalidInput();
  maxDistanceKm =
    maxDistanceKm === undefined
    ? 20
    : maxDistanceKm

if (
  typeof maxDistanceKm !== 'number' ||
  !Number.isInteger(maxDistanceKm) ||
  maxDistanceKm < 1 ||
  maxDistanceKm > 200
) {
  return invalidInput('A distância máxima deve ser um número inteiro entre 20 e 200 km');
}
  return { products: requested, latitude, longitude, priority, maxDistanceKm };
}
