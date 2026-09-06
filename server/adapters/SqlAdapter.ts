import type { Options, Response } from '../../types/Paginated';
import { normalizePagination } from '../utils/pagination';
import { paginationFilter } from '../database/queries/pagination';
import { asc, count, eq, inArray } from 'drizzle-orm';
import { getDatabase } from '../database/client';
import { getEntityMapping } from '../database/entity-map';
import type { RepositoryAdapter } from './RepositoryAdapter';

export class SqlAdapter<T extends { id: number }> implements RepositoryAdapter<T> {
  private readonly mapping;

  constructor(private readonly entityName: string) {
    this.mapping = getEntityMapping(entityName);
  }

  private validateId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error(`Invalid persistence id: ${id}. Expected a positive integer.`);
    }
  }

  private fromDatabase(record: Record<string, unknown>): T {
    return this.mapping.fromDatabase(record) as T;
  }

  async getPaginated(options: Options): Promise<Response<T>> {
    const { prop, search, perPage, offset } = normalizePagination(options);
    const filter = paginationFilter(this.entityName, prop, search);
    const db = getDatabase();
    const [totals, rows] = await Promise.all([
      db.select({ total: count() }).from(this.mapping.table).where(filter),
      db.select().from(this.mapping.table).where(filter)
        .orderBy(asc(this.mapping.table.id)).limit(perPage).offset(offset),
    ]);
    return { items: rows.map(row => this.fromDatabase(row)), total: totals[0].total };
  }

  async getAll(): Promise<T[]> {
    const rows = await getDatabase()
      .select()
      .from(this.mapping.table)
      .orderBy(asc(this.mapping.table.id));

    return rows.map((row) => this.fromDatabase(row));
  }

  async getById(id: number): Promise<T | undefined> {
    this.validateId(id);
    const [row] = await getDatabase()
      .select()
      .from(this.mapping.table)
      .where(eq(this.mapping.table.id, id))
      .limit(1);

    return row ? this.fromDatabase(row) : undefined;
  }

  async add(item: T): Promise<void> {
    const values = this.mapping.toDatabase(item as Record<string, unknown>);
    const [inserted] = await getDatabase()
      .insert(this.mapping.table)
      .values(values)
      .returning();

    Object.assign(item, this.fromDatabase(inserted));
  }

  async update(id: number, updated: Partial<T>): Promise<T | null> {
    this.validateId(id);
    const values = this.mapping.toDatabase(updated as Record<string, unknown>);

    if (Object.keys(values).length === 0) {
      return (await this.getById(id)) ?? null;
    }

    const [row] = await getDatabase()
      .update(this.mapping.table)
      .set(values)
      .where(eq(this.mapping.table.id, id))
      .returning();

    return row ? this.fromDatabase(row) : null;
  }

  async delete(id: number): Promise<boolean> {
    this.validateId(id);
    const deleted = await getDatabase()
      .delete(this.mapping.table)
      .where(eq(this.mapping.table.id, id))
      .returning({ id: this.mapping.table.id });

    return deleted.length > 0;
  }

  async getByIds(ids: number[]): Promise<T[]> {
    if (ids.length === 0) return [];
    ids.forEach((id) => this.validateId(Number(id)));

    const rows = await getDatabase()
      .select()
      .from(this.mapping.table)
      .where(inArray(this.mapping.table.id, ids))
      .orderBy(asc(this.mapping.table.id));

    return rows.map((row) => this.fromDatabase(row));
  }
}
