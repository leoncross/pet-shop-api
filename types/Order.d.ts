import { Product } from './Product'

export type OrderStatus = 'ORDER PENDING' | 'ORDER RECEIVED' | 'ORDER DISPATCHED' | 'ORDER COMPLETE'

export type CreateOrder = {
  image: string
  name: string
  price: string
  productId: string
  quantity: string
  quantityAvailable: string
}

export type PendingOrder = {}

export type Order = {
  id: string // same as `sk`
  orderDate: string
  dispatchDate: string
  items: Array<{
    productId: string
    product: Product
    quantity: string
  }>
  price: number
  deliveryType: string
  status: OrderStatus
}

export type OrderComplete = {} // include customer address? email address? customer ID?

export type DynamodbOrder = Order & {
  pk: string // `USER#${userId}`
  sk: string // `ORDER#${id}`
}
