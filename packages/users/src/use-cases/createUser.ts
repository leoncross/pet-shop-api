import { User } from '../../../../types/User'
import { Context } from '../../types'

export type CreateUserInput = Omit<User, 'id'>

export const createUser = async (input: CreateUserInput, context: Context) => {
  const user = { ...input, id: input.email }
  return context.userRepository.create(user)
}
