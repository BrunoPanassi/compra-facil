export class SqlAdapter<T extends { id: number }> {
  constructor(private tableName: string) {}

  async getAll(): Promise<T[]> {
    // Placeholder: substituir com SELECT * FROM tableName
    return [];
  }

  async getById(id: number): Promise<T | undefined> {
    // Placeholder: substituir com SELECT * FROM tableName WHERE id = ?
    return undefined;
  }

  async add(item: T): Promise<void> {
    // Placeholder: substituir com INSERT INTO tableName (...) VALUES (...)
  }

  async update(id: number, updated: T): Promise<void> {
    // Placeholder: substituir com UPDATE tableName SET ... WHERE id = ?
  }

  async delete(id: number): Promise<void> {
    // Placeholder: substituir com DELETE FROM tableName WHERE id = ?
  }

  async getByIds(ids: number[]): Promise<T[]> {
    //
    return []
  }
}
