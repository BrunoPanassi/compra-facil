import { asc, eq, inArray } from 'drizzle-orm';
import { getDatabase } from '../database/client';
import { getEntityMapping } from '../database/entity-map';
import type { RepositoryAdapter } from './RepositoryAdapter';

export class SqlAdapter<T extends { id: number }> implements RepositoryAdapter<T> {
  private readonly mapping;

  constructor(entityName: string) {
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
