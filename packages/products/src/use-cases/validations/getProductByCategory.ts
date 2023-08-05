import { GetProductByCategoryInput } from '../getProductByCategory'

export const getProductByCategory = (input: Partial<GetProductByCategoryInput>): GetProductByCategoryInput => {
  if (!input['category'] && typeof input['category'] !== 'string') {
    throw new Error('Invalid category. Expected a string.')
  }
  return {
    category: input.category,
  }
}
