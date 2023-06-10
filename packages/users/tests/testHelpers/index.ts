import { v4 as uuidv4 } from 'uuid';
import { User } from '../../../../types/User';

export const generateUserId = () => uuidv4();
export const generateUser = (userData?: Partial<User>): User => {
  const id = generateUserId();

  const defaultUser: User = {
    id,
    firstName: 'John',
    lastName: 'Doe',
    email: `user${id}@example.com`,
    phone: '1234567890',
    address: {
      street: '123 Main St',
      city: 'City',
      state: 'State',
      postalCode: '12345',
      country: 'Country',
    },
  };

  return { ...defaultUser, ...userData };
};
