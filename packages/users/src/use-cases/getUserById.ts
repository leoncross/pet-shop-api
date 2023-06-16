import { Context } from '../../types'

export interface GetUserByIdInput {
  id: string
}

export const getUserById = async (input: GetUserByIdInput, context: Context) => context.userRepository.get(input.id)
