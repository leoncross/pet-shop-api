import { getUserById, GetUserByIdInput } from '../../../src/use-cases/getUserById';
import { UserRepository } from '../../../src/repositories/UserRepository';
import { Context } from '../../../types';

describe('getUserById', () => {
  let userRepository: UserRepository;
  let context: Context;

  beforeEach(() => {
    userRepository = new UserRepository();
    context = {
      logger: {},
      userRepository,
    };

    userRepository.get = jest.fn();
  });

  it('should get a user by ID', async () => {
    const userId = '123456';
    const user = {
      id: userId,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      address: {
        street: '123 Street',
        city: 'City',
        state: 'State',
        postalCode: '12345',
        country: 'Country',
      },
    };

    userRepository.get = jest.fn().mockResolvedValue(user);

    const input: GetUserByIdInput = { id: userId };

    const res = await getUserById(input, context);

    expect(userRepository.get).toHaveBeenCalledWith(userId);
    expect(res).toEqual(user);
  });

  it('should return null if user not found', async () => {
    const userId = '123456';

    userRepository.get = jest.fn().mockResolvedValue(null);

    const input: GetUserByIdInput = {
      id: userId,
    };

    const res = await getUserById(input, context);

    expect(userRepository.get).toHaveBeenCalledWith(userId);
    expect(res).toBeNull();
  });

  it('should throw an error if an exception occurs', async () => {
    const userId = '123456';

    userRepository.get = jest.fn().mockRejectedValue(new Error());

    const input: GetUserByIdInput = {
      id: userId,
    };

    await expect(getUserById(input, context)).rejects.toThrowError();
  });
});
