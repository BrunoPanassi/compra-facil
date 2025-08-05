import { BaseService } from "./BaseService";
import type { DataAdapter, Options } from "~/types/Paginated";
import type { ProductStore } from "~/types/ProductStore";
import { ProductStoreRepository } from "../repositories/ProductStoreRepository";

export class ProductStoreService extends BaseService<ProductStore, ProductStoreRepository> implements DataAdapter<ProductStore> {
  
  constructor(repo: ProductStoreRepository = new ProductStoreRepository()) {
    super(repo);
  }

  async getPaginated(options: Options) {
    return await this.repository.getPaginated(options)
  }
}