
export type Order = {
  id: string; // same as `sk`
  orderDate: string;
  dispatchDate: string;
  items: Array<{
    productId: string;
    product: Product;
    quantity: string;
  }>;
  price: number;
  deliveryType: string;
};

export type DynamodbOrder = {
  pk: string; // `USER#${userId}`
  sk: string; // `ORDER#${id}`
}
