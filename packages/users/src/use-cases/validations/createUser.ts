import { CreateUserInput } from '../createUser';
import { Address } from '../../../../../types/User';

function validateString(value: unknown, propertyName: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Invalid or missing ${propertyName}`);
  }

  return value;
}

function validateAddress(input: Partial<Address>): Address {
  const { street, city, state, postalCode, country } = input;

  const validatedStreet = validateString(street, 'street');
  const validatedCity = validateString(city, 'city');
  const validatedState = validateString(state, 'state');
  const validatedPostalCode = validateString(postalCode, 'postalCode');
  const validatedCountry = validateString(country, 'country');

  return {
    street: validatedStreet,
    city: validatedCity,
    state: validatedState,
    postalCode: validatedPostalCode,
    country: validatedCountry,
  };
}

export const createUser = (
  input: Partial<CreateUserInput>
): CreateUserInput => {
  const { firstName, lastName, email, address, phone } = input;

  return {
    firstName: validateString(firstName, 'firstName'),
    lastName: validateString(lastName, 'lastName'),
    email: validateString(email, 'email'),
    phone: validateString(phone, 'phone'),
    address: validateAddress(address as Partial<Address>),
  };
};
