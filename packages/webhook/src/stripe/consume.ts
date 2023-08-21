import Stripe from 'stripe'

export const consumeStripeEvent = async (event: Stripe.Event) => {
  //  figure out what events to listen to
  if (event.type === 'checkout.session.completed') {
    // make request to order lambda function
    return Promise.resolve()
  }
}
