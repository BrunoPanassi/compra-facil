import { BaseService } from "./BaseService";
import type { ProductStore } from "~/types/ProductStore";
import { ProductStoreRepository } from "../repositories/ProductStoreRepository";

export class ProductStoreService extends BaseService<ProductStore, ProductStoreRepository> {
  
  constructor(repo: ProductStoreRepository = new ProductStoreRepository()) {
    super(repo);
  }
}