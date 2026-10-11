import type { Product } from './Product';
import type { ProdutStoreProductDetail } from './ProductStore';
import type { Store } from './Store';

export interface RequestedProduct { productId: number; quantity: number }
export interface BestStoreSearchParams {
  products: RequestedProduct[];
  latitude: number;
  longitude: number;
  priority: 'price' | 'distance';
  maxDistanceKm: number;
}
export interface BestStoreQueryParams extends BestStoreSearchParams {
  priceWeight: number;
  distanceWeight: number;
}
export interface BestStoreProduct extends ProdutStoreProductDetail {
  requestedQuantity: number;
  availableQuantity: number;
  subtotal: string;
  available: true;
}
export interface MissingBestStoreProduct extends Product {
  requestedQuantity: number;
  availableQuantity: number;
}
export interface BestStoreResult {
  store: Store;
  totalPrice: number;
  distance: number;
  score: number;
  coverage: number;
  requestedCount: number;
  foundProducts: BestStoreProduct[];
  missingProducts: MissingBestStoreProduct[];
}
