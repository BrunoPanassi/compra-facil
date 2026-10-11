import { sql } from 'drizzle-orm';
import { getDatabase } from '../client';
import type { BestStoreQueryParams, BestStoreResult } from '../../../types/BestStore';

/** One statement: ranking and batched details share the PostgreSQL snapshot. */
export function bestStoresStatement(params: BestStoreQueryParams) {
  const requested = JSON.stringify(params.products);
  return sql`
    WITH requested_products AS (
      SELECT "productId" AS id, quantity
      FROM jsonb_to_recordset(${requested}::jsonb) AS r("productId" integer, quantity integer)
    ), store_distances AS (
      SELECT
        s.id,

        2 * 6371.0088 * asin(
          sqrt(
            least(
              1.0::double precision,
              greatest(
                0.0::double precision,

                power(
                  sin(
                    radians(
                      s.lat::double precision
                      - ${params.latitude}::double precision
                    ) / 2
                  ),
                  2
                )

                +

                cos(
                  radians(${params.latitude}::double precision)
                )

                *

                cos(
                  radians(s.lat::double precision)
                )

                *

                power(
                  sin(
                    radians(
                      s.lon::double precision
                      - ${params.longitude}::double precision
                    ) / 2
                  ),
                  2
                )
              )
            )
          )
        ) AS distance
      FROM stores s
    ), nearby_stores AS (
          SELECT
              id,
              distance

          FROM store_distances

          WHERE distance <= ${params.maxDistanceKm}::double precision
      ),
      available_products AS (
        SELECT
            ps.id_store,
            ps.id_product,

            ps.price * r.quantity::numeric AS subtotal

        FROM requested_products r

        JOIN product_stores ps
            ON ps.id_product = r.id

        JOIN nearby_stores ns
            ON ns.id = ps.id_store

        WHERE ps.quantity >= r.quantity
    ), store_coverage AS (
      SELECT id_store, count(*)::integer AS coverage, sum(subtotal) AS total_price
      FROM available_products GROUP BY id_store
    ), max_coverage AS (
      SELECT max(coverage) AS coverage FROM store_coverage
    ), candidates AS (
        SELECT
            c.*,
            s.*,
            ns.distance

        FROM store_coverage c

        JOIN max_coverage m
            ON c.coverage = m.coverage

        JOIN stores s
            ON s.id = c.id_store

        JOIN nearby_stores ns
            ON ns.id = s.id
    ), normalized AS (
      SELECT *, coalesce(total_price / nullif(max(total_price) OVER (), 0), 0) AS price_norm,
        coalesce(distance / nullif(max(distance) OVER (), 0), 0) AS distance_norm
      FROM candidates
    ), ranked AS (
      SELECT *, price_norm * ${params.priceWeight}::numeric
        + distance_norm * ${params.distanceWeight}::double precision AS score
      FROM normalized
      ORDER BY score, total_price, distance, id LIMIT 3
    ), details AS (
      SELECT b.id AS store_id, r.id AS product_id, r.quantity AS requested_quantity,
        p.name, p.brand, p."desc", p.material_id, p.images,
        ps.price::text AS price, coalesce(ps.quantity, 0) AS available_quantity,
        coalesce(ps.quantity >= r.quantity, false) AS available,
        CASE WHEN ps.quantity >= r.quantity THEN (ps.price * r.quantity::numeric)::text ELSE '0.00' END AS subtotal
      FROM ranked b CROSS JOIN requested_products r
      LEFT JOIN products p ON p.id = r.id
      LEFT JOIN product_stores ps ON ps.id_product = r.id AND ps.id_store = b.id
    )
    SELECT b.id, b.name, b.street, b.nr, b.neighbr, b.city, b.state, b.zip,
      b.lat, b.lon, b.owner_id, b.description, b.cellphone, b.cellphone_second,
      b.email, b.facebook, b.instagram, b.another,
      b.total_price::text AS total_price, b.distance, b.score, b.coverage,
      (SELECT jsonb_agg(to_jsonb(d) ORDER BY d.product_id) FROM details d WHERE d.store_id = b.id) AS details
    FROM ranked b ORDER BY b.score, b.total_price, b.distance, b.id
  `;
}

type Detail = {
  product_id: number; requested_quantity: number; available_quantity: number; available: boolean;
  name: string | null; brand: string | null; desc: string | null; material_id: number | null;
  images: string[] | null; price: string | null; subtotal: string;
};
type NullableStoreFields = 'description' | 'email' | 'cellphone_second' | 'facebook' | 'instagram' | 'another';
type Row = Omit<BestStoreResult['store'], 'lat' | 'lon' | NullableStoreFields> & {
  description: string | null; email: string | null; cellphone_second: string | null;
  facebook: string | null; instagram: string | null; another: string | null;
  lat: string; lon: string; total_price: string; distance: number; score: number;
  coverage: number; details: Detail[];
};

export async function findBestStores(params: BestStoreQueryParams): Promise<BestStoreResult[]> {
  const { rows } = await getDatabase().execute<Row>(bestStoresStatement(params));
  return rows.map(row => {
    const { total_price, distance, score, coverage, details, ...store } = row;
    const result: BestStoreResult = {
      store: { ...store, lat: Number(store.lat), lon: Number(store.lon),
        description: store.description ?? '', email: store.email ?? '',
        cellphone_second: store.cellphone_second ?? undefined, facebook: store.facebook ?? undefined,
        instagram: store.instagram ?? undefined, another: store.another ?? undefined },
      // NUMERIC remains decimal text until this explicit API boundary.
      totalPrice: Number(total_price), distance: Number(distance), score: Number(score),
      coverage, requestedCount: params.products.length, foundProducts: [], missingProducts: [],
    };
    for (const detail of details) {
      const product = { id: detail.product_id, name: detail.name ?? `Produto #${detail.product_id}`,
        brand: detail.brand ?? '', desc: detail.desc ?? undefined,
        material_id: detail.material_id ?? 0, images: detail.images ?? [] };
      if (detail.available) result.foundProducts.push({ ...product,
        id_store: row.id, id_product: detail.product_id, price: detail.price!,
        quantity: detail.requested_quantity, requestedQuantity: detail.requested_quantity,
        availableQuantity: detail.available_quantity, available: true, subtotal: detail.subtotal,
      });
      else result.missingProducts.push({ ...product, requestedQuantity: detail.requested_quantity,
        availableQuantity: detail.available_quantity });
    }
    return result;
  });
}
