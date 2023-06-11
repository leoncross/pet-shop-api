import { GetUserByIdInput } from '../getUserById';

export const getUserById = (
  input: Partial<GetUserByIdInput>
): GetUserByIdInput => {
  if (!input.id && typeof input.id !== 'string') {
    throw new Error('Invalid userId. Expected a string.');
  }
  return {
    id: input.id,
  };
};
