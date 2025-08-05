import { BaseService } from "./BaseService";
import type { Product } from "~/types/Product";
import { ProductRepository } from "../repositories/ProductRepository";
import type { DataAdapter, Options } from "~/types/Paginated";

export class ProductService extends BaseService<Product, ProductRepository> implements DataAdapter<Product> {
  
  constructor(repo: ProductRepository = new ProductRepository()) {
    super(repo);
  }

  async getPaginated(options: Options) {
    return await this.repository.getPaginated(options)
  }
}