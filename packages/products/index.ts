import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult, Context } from 'aws-lambda'
import { ProductRepository, ProductService } from '@pet-shop-api/core'
import { log, errorHandler, NotFoundError, BadRequestError } from '@pet-shop-api/common'
import config from './src/config'

const productRepository = new ProductRepository(config.get('dbTableName'))
const productService = new ProductService({ productRepository })

async function getProductById(id: string): Promise<APIGatewayProxyResult> {
  const product = await productService.getProductById(id)
  if (!product) {
    throw new NotFoundError('Product not found')
  }
  return { statusCode: 200, body: JSON.stringify(product) }
}

async function getProductsByCategory(category: string): Promise<APIGatewayProxyResult> {
  const products = await productService.getProductsByCategory(category)
  return { statusCode: 200, body: JSON.stringify(products) }
}

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
  log.setContext(context.awsRequestId)
  const { httpMethod, path, pathParameters, queryStringParameters } = event

  try {
    log.info('Handling request', { httpMethod, path })

    if (path !== '/products' && !path?.startsWith('/products/')) {
      throw new BadRequestError('Unrecognized path')
    }

    if (httpMethod !== 'GET') {
      throw new BadRequestError('Only GET method is supported')
    }

    if (pathParameters && pathParameters['id']) {
      return getProductById(pathParameters['id'])
    }

    if (queryStringParameters && queryStringParameters['category']) {
      return getProductsByCategory(queryStringParameters['category'])
    }

    throw new BadRequestError('Path or query parameters not recognized')
  } catch (error) {
    log.error('Error handling request', { error })
    return errorHandler(error)
  }
}
