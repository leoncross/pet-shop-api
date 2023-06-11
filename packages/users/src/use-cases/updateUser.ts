import { PartialUser, User } from '../../../../types/User';
import { Context } from '../../types';

export type UpdateUserInput = PartialUser;
export const updateUser = async (
  input: UpdateUserInput,
  context: Context
): Promise<User | null> => {
  const existingUser = await context.userRepository.get(input.id);

  if (!existingUser) {
    return null;
  }

  return context.userRepository.update({ ...input, ...existingUser });
};
