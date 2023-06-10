export type Address = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type User = {
  id: string; // will be email address
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: Address
};

export type PartialUser = Omit<Partial<User>, 'id' | 'address'> & { id: string, address?: Partial<Address> };

export type DynamodbUser = User & {
  pk: string; // `USER#${userId}`
  sk: string; // `USER#${userId}`
};

export type PartialDynamodbUser = PartialUser & {
  pk: string; // `USER#${userId}`
  sk: string; // `USER#${userId}`
};
