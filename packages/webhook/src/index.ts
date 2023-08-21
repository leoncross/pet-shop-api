import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda'
import { validateStripeWebhook } from './stripe/validate'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const validatedStripeEvent = validateStripeWebhook(event)

    if (!validatedStripeEvent) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Webhook signature verification failed' }) }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Hello, World!' }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    }
  }
}
