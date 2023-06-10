import { Context } from '../../types';

export interface GetUserByIdInput {
  id: string;
}

const validate = (input: GetUserByIdInput) => {
  const { id } = input;
  if (!id) {
    throw new Error('INVALID');
  }
};

export const getUserById = async (input: GetUserByIdInput, context: Context) => {
  if (context.logger) {
    console.log('it exists');
  }
  validate(input);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Success' }),
  };
};
