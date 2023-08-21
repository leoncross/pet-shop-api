import { APIGatewayEvent } from 'aws-lambda'
import Stripe from 'stripe'
import config from '../config'

export const validateStripeWebhook = (event: APIGatewayEvent) => {
  const stripe = new Stripe(config.get('stripeApiKey'), { apiVersion: '2022-08-01' })
  const signingSecret: string = config.get('stripeSigningSecret')

  try {
    return stripe.webhooks.constructEvent(event.body || '', event.headers['Stripe-Signature'] || '', signingSecret)
  } catch (error) {
    return null
  }
}
