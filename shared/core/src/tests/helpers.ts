import { Product } from '../domain/Product'
import { v4 as uuidv4 } from 'uuid'
import { DynamodbProduct } from '../infra/repositories/ProductRepository'

function generateProduct(overrideData: Partial<Product> = {}): Product {
  return new Product({
    id: overrideData.id || uuidv4(),
    category: overrideData.category || 'Toy',
    subcategory: overrideData.subcategory || 'Rope',
    name: overrideData.name || 'Knotted Rope Toy',
    slug: overrideData.slug || 'knotted-rope-toy',
    colour: overrideData.colour || 'Blue',
    description:
      overrideData.description ||
      'This Knotted Rope Dog Toy is the ideal choice for games of tug of war and teaching your dog about throw and fetch',
    price: overrideData.price || 19.99,
    quantityAvailable: overrideData.quantityAvailable || 5,
    showAsAvailable: overrideData.showAsAvailable !== undefined ? overrideData.showAsAvailable : true,
    images: {
      main: overrideData.images?.main || 'path/to/main/image.jpg',
      hover: overrideData.images?.hover || 'path/to/hover/image.jpg',
      other: overrideData.images?.other || ['path/to/other/image1.jpg', 'path/to/other/image2.jpg'],
    },
  })
}

function generateDdbProduct(overrideData: Partial<DynamodbProduct> = {}): DynamodbProduct {
  const id = overrideData.id || uuidv4()
  return {
    pk: `PRODUCT#${id}`,
    sk: `CATEGORY#${overrideData.category || 'Toy'}`,
    id,
    category: overrideData.category || 'Toy',
    subcategory: overrideData.subcategory || 'Rope',
    name: overrideData.name || 'Knotted Rope Toy',
    slug: overrideData.slug || 'knotted-rope-toy',
    colour: overrideData.colour || 'Blue',
    description:
      overrideData.description ||
      'This Knotted Rope Dog Toy is the ideal choice for games of tug of war and teaching your dog about throw and fetch',
    price: overrideData.price || 19.99,
    quantityAvailable: overrideData.quantityAvailable || 5,
    showAsAvailable: overrideData.showAsAvailable !== undefined ? overrideData.showAsAvailable : true,
    images: {
      main: overrideData.images?.main || 'path/to/main/image.jpg',
      hover: overrideData.images?.hover || 'path/to/hover/image.jpg',
      other: overrideData.images?.other || ['path/to/other/image1.jpg', 'path/to/other/image2.jpg'],
    },
  }
}

export { generateDdbProduct, generateProduct }
