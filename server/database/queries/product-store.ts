import { asc, eq } from 'drizzle-orm';
import { getDatabase } from '../client';
import { products, productStores } from '../schema';
import { validateStoreId } from '../../utils/pagination';
import type { ProductStoreWithProduct } from '../../../types/ProductStore';

export async function getProductStoresByStore(storeId: number): Promise<ProductStoreWithProduct[]> {
  validateStoreId(storeId);
  const rows = await getDatabase().select({
    id: productStores.id, id_store: productStores.idStore, id_product: productStores.idProduct,
    price: productStores.price, quantity: productStores.quantity,
    product: { id: products.id, name: products.name, brand: products.brand, desc: products.desc,
      material_id: products.materialId, images: products.images },
  }).from(productStores).innerJoin(products, eq(products.id, productStores.idProduct))
    .where(eq(productStores.idStore, storeId)).orderBy(asc(productStores.id));
  return rows.map(row => ({ ...row, product: { ...row.product, desc: row.product.desc ?? undefined } }));
}
