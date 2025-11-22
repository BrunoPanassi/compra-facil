import { BaseService } from "./BaseService";
import type { Product } from "~/types/Product";
import { ProductRepository } from "../repositories/ProductRepository";
import type { DataAdapter, Options } from "~/types/Paginated";
import { processImageAndReturnUrl } from "~/util/image";

export class ProductService extends BaseService<Product, ProductRepository> implements DataAdapter<Product> {
  
  constructor(repo: ProductRepository = new ProductRepository()) {
    super(repo);
  }

  async getPaginated(options: Options) {
    return await this.repository.getPaginated(options)
  }

  async handleImageObject(images: string[] | File[]) {
    let imagesHandled: string[] = []
    for (const image of images) {
      const data = await processImageAndReturnUrl(image)
      imagesHandled.push(data)
    }
    return imagesHandled
  }

  async validateProductObject(product: Product) {
    let images = product.images as string[] | File[]
    product.images = await this.handleImageObject(images)
    return product
  }

  override async create(product: Product) {
    product = await this.validateProductObject(product)
    return super.create(product)
  }
}