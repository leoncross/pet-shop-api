import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda'
import { Context } from './types'
import { ProductRepository } from '@pet-shop-api/repositories'
import * as usecase from './src/use-cases'
import config from './src/config'
const successResult = (value: unknown) => ({
  statusCode: 200,
  body: JSON.stringify(value),
})

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  try {
    const { httpMethod, path, pathParameters = {}, queryStringParameters = {} } = event

    if (!path.includes('/products')) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Not Found' }),
      }
    }

    const context: Context = {
      logger: {},
      productRepository: new ProductRepository(config.get('dbTableName')),
    }

    if (httpMethod != 'GET') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid request' }),
      }
    }

    if (pathParameters?.['id']) {
      const input = usecase.validations.getProductById({ id: pathParameters?.['id'] })
      const product = await usecase.getProductById(input, context)
      return successResult(product)
    }
    if (queryStringParameters?.['category']) {
      const input = usecase.validations.getProductByCategory(queryStringParameters)
      const products = await usecase.getProductByCategory(input, context)
      return successResult(products)
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid request' }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    }
  }
}
