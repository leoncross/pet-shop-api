import { GetProductByIdInput } from '../getProductById'

export const getProductById = (input: Partial<GetProductByIdInput>): GetProductByIdInput => {
  if (!input.id && typeof input.id !== 'string') {
    throw new Error('Invalid id. Expected a string.')
  }
  return {
    id: input.id,
  }
}
