import { Context } from '../../types'

export interface GetProductByCategoryInput {
  category: string
}

export const getProductByCategory = async (input: GetProductByCategoryInput, context: Context) =>
  context.productRepository.getByCategory(input.category)
