import { APIGatewayProxyEvent, APIGatewayProxyHandler, Context } from 'aws-lambda'
import { ProductRepository, ProductService } from '@pet-shop-api/core'
import { log, errorHandler, BadRequestError } from '@pet-shop-api/common'
import config from './src/config'

const productRepository = new ProductRepository(config.get('dbTableName'))
const productService = new ProductService({ productRepository })

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
  log.setContext(context.awsRequestId)

  try {
    console.log('basic log - latest version')
    log.info('logging - latest version')
    const { httpMethod, path, pathParameters, queryStringParameters } = event

    if (path !== '/products' && !path?.startsWith('/products/')) {
      throw new BadRequestError('Unrecognized path')
    }

    if (httpMethod !== 'GET') {
      throw new BadRequestError('Only GET method is supported')
    }

    if (pathParameters && pathParameters['id']) {
      const product = await productService.getProductById(pathParameters['id'])
      if (!product) {
        throw new BadRequestError('Product not found')
      }
      return { statusCode: 200, body: JSON.stringify(product) }
    }

    if (queryStringParameters && queryStringParameters['category']) {
      const products = await productService.getProductsByCategory(queryStringParameters['category'])
      return { statusCode: 200, body: JSON.stringify(products) }
    }

    throw new BadRequestError('Path or query parameters not recognized')
  } catch (error) {
    return errorHandler(error)
  }
}
