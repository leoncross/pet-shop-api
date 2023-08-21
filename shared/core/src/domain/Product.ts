export class Product {
  id: string
  category: string
  subcategory: string
  name: string
  slug: string
  colour: string
  description: string
  price: number
  quantityAvailable: number
  showAsAvailable: boolean
  images: {
    main: string
    hover: string
    other: Array<string>
  }

  constructor(data: Product) {
    this.id = data.id
    this.category = data.category
    this.subcategory = data.subcategory
    this.name = data.name
    this.slug = data.slug
    this.colour = data.colour
    this.description = data.description
    this.price = data.price
    this.quantityAvailable = data.quantityAvailable
    this.showAsAvailable = data.showAsAvailable
    this.images = data.images
  }
}
