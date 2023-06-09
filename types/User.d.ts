export type User = {
  id: string; // will be email address
  firstName: string;
  lastName: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phone: string;
};

export type DynamodbUser = User & {
  pk: string; // `USER#${userId}`
  sk: string; // `USER#${userId}`
}
