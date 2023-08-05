import { Context } from '../../types'

export interface GetProductByIdInput {
  id: string
}

export const getProductById = async (input: GetProductByIdInput, context: Context) =>
  context.productRepository.getById(input.id)
