import { v4 as uuidv4 } from 'uuid'
import { Product } from '../../../../types/Product'

export const generateProductId = () => uuidv4()
export const generateProduct = (productData?: Partial<Product>): Product => {
  const id = generateProductId()

  const defaultProduct: Product = {
    id,
    category: 'toy',
    subcategory: 'rope',
    name: 'Rope Toy',
    slug: 'rope-toy',
    colour: 'red',
    description: 'Durable pet rope toy',
    price: 19.99,
    quantityAvailable: 50,
    showAsAvailable: true,
    images: {
      main: 'main.jpg',
      hover: 'hover.jpg',
      other: ['other1.jpg', 'other2.jpg'],
    },
  }

  return { ...defaultProduct, ...productData }
}
