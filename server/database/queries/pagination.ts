import { sql, type SQL } from 'drizzle-orm';
import { products, productStores } from '../schema';

// SQL expressions are fixed here; request properties never become SQL identifiers.
const productSearch = {
  id: sql`${products.id}::text`, name: sql`${products.name}`,
  brand: sql`${products.brand}`, desc: sql`${products.desc}`,
  material_id: sql`${products.materialId}::text`,
  images: sql`array_to_string(${products.images}, ',')`,
};
const associationSearch = {
  id: sql`${productStores.id}::text`, id_store: sql`${productStores.idStore}::text`,
  id_product: sql`${productStores.idProduct}::text`, price: sql`${productStores.price}::text`,
  quantity: sql`${productStores.quantity}::text`,
};
export const searchableProperties = {
  products: Object.keys(productSearch),
  'product-store': Object.keys(associationSearch),
};

export function paginationFilter(entity: string, prop: string, search: string): SQL | undefined {
  const columns: Readonly<Record<string, SQL>> = entity === 'products' ? productSearch
    : entity === 'product-store' ? associationSearch : {};
  if (!search) return undefined;
  // Unknown properties previously matched nothing, including the association default "name".
  if (!Object.hasOwn(columns, prop)) return sql`false`;
  // strpos preserves literal %, _ and backslashes, just like String.includes.
  return sql`strpos(lower(coalesce(${columns[prop]}, '')), ${search.toLowerCase()}) > 0`;
}
