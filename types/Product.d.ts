import { Address, User } from "./User";

export type Product = {
  id: string; // same as `sk`
  category: string; // toy
  subcategory: string; // rope
  name: string;
  slug: string;
  colour: string;
  description: string;
  price: number;
  quantityAvailable: number;
  showAsAvailable: boolean;
  images: {
    main: string;
    hover: string;
    other: Array<string>;
  };
};

export type DynamodbProduct = Product &{
  pk: string; // `PRODUCT#${id}`
  sk: string; // `CATEGORY#${category}`
};
