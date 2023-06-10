import { User } from '../../../../types/User';
import { Context } from '../../types';

export type CreateUserInput = Omit<User, 'id'>;

export const createUser = async (input: CreateUserInput, context: Context) => {
  const user = { ...input, id: input.email };
  await context.userRepository.create(user);

  return {
    statusCode: 200,
    body: JSON.stringify(input),
  };
};
