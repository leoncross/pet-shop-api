import { User, Address, PartialUser } from '../../../../../types/User';

function validateString(value: unknown, propertyName: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Invalid or missing ${propertyName}`);
  }

  return value;
}

function validateOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  return value;
}

function validateAddress(input: Partial<Address>): Partial<Address> {
  const {
    street, city, state, postalCode, country,
  } = input;

  const validatedStreet = validateOptionalString(street);
  const validatedCity = validateOptionalString(city);
  const validatedState = validateOptionalString(state);
  const validatedPostalCode = validateOptionalString(postalCode);
  const validatedCountry = validateOptionalString(country);

  return {
    street: validatedStreet,
    city: validatedCity,
    state: validatedState,
    postalCode: validatedPostalCode,
    country: validatedCountry,
  };
}

export const updateUser = (id: string | undefined, input: Partial<User>): PartialUser => {
  const {
    firstName,
    lastName,
    email,
    address,
    phone,
  } = input;

  return {
    id: validateString(id, 'id'),
    firstName: validateOptionalString(firstName),
    lastName: validateOptionalString(lastName),
    email: validateOptionalString(email),
    phone: validateOptionalString(phone),
    address: validateAddress(address as Partial<Address>),
  };
};
