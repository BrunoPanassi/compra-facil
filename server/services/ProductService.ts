import { BaseService } from "./BaseService";
import type { Product } from "~/types/Product";
import { ProductRepository } from "../repositories/ProductRepository";

export class ProductService extends BaseService<Product, ProductRepository> {
  
  constructor(repo: ProductRepository = new ProductRepository()) {
    super(repo);
  }
}