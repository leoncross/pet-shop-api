import Stripe from 'stripe'
import config from '../config'
import { CreateOrder } from '../../../../types/Order'
import currency from 'currency.js'

export type CreateOrderInput = {
  cancelUrl: string
  successUrl: string
  purchases: Array<CreateOrder>
}

const deliveryOptions: Array<Stripe.Checkout.SessionCreateParams.ShippingOption> = [
  {
    shipping_rate_data: {
      display_name: 'Royal Mail UK Standard delivery',
      type: 'fixed_amount',
      fixed_amount: {
        amount: currency(config.get('deliveryPrice')).value,
        currency: 'gbp',
      },
      delivery_estimate: {
        maximum: {
          unit: 'business_day',
          value: 5,
        },
      },
    },
  },
]

export const createOrder = async (order: CreateOrderInput) => {
  const { successUrl, cancelUrl, purchases } = order

  const stripe = new Stripe(config.get('stripeApiKey'), {
    apiVersion: '2022-11-15',
  })

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    shipping_address_collection: { allowed_countries: ['GB'] },
    shipping_options: deliveryOptions,
    line_items: purchases.map((item) => ({
      adjustable_quantity: { enabled: false },
      quantity: Number(item.quantity),
      price_data: {
        currency: 'gbp',
        unit_amount: currency(item.price).value,
        product_data: {
          name: item.name,
          images: [item.image],
        },
      },
    })),
  })

  if (!checkoutSession.url) {
    throw new Error('No session URL')
  }

  // TODO: Save order to DynamoDB
  //  - create / update user

  return checkoutSession.url
}
