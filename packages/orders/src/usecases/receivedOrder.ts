// import Stripe from 'stripe'
// import config from '../config'
// import { OrderComplete } from '../../../../types/Order'
//
// const receivedOrder = async (id: string) => {
//   const stripe = new Stripe(config.get('stripeApiKey'), {
//     apiVersion: '2022-11-15',
//   })
//
//   const order = await stripe.paymentIntents.retrieve(id)
//
//   const completeOrder: OrderComplete = {
//     id: order.id,
//     orderDate: order.created,
//     price: order.amount,
//     deliveryType: order.shipping,
//
//     // .... TO FIGURE OUT HOW TO DO THIS
//     //   TODO: do i want to just put all customer data in the order?
//     //     probably not. but do need to specify the customers address etc.
//   }
//
//   //   TODO - add logic to update order in DynamoDB
// }
