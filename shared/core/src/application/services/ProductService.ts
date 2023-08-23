import { Product } from '../../domain'
import { ProductRepository } from '../../infra'

export type ProductServiceContext = {
  productRepository: ProductRepository
}

export class ProductService {
  private productRepository: ProductRepository

  constructor(context: ProductServiceContext) {
    this.productRepository = context.productRepository
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.productRepository.getById(id)
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.productRepository.getByCategory(category)
  }
}
